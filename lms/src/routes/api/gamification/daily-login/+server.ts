import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { hasFeature } from '$lib/server/tenant-features';

/** GET /api/gamification/daily-login — check + award daily login reward (once per day) */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		if (!hasFeature(locals?.tenant, 'gamification')) {
			return jsonResponse({ success: false, error: 'Fitur gamification tidak aktif', disabled: true }, 403);
		}

		const db = getDB(platform);
		const userId = session.user.id;
		const today = new Date().toISOString().slice(0, 10);

		// Already claimed today?
		const existing = await db.prepare(
			`SELECT id FROM xp_transactions
			 WHERE user_id = ? AND reason = 'daily_login' AND date(created_at) = date(?)
			 LIMIT 1`
		).bind(userId, today).first<any>();

		if (existing) {
			return jsonResponse({ success: true, data: { claimed: false, already: true, xp: 0 } });
		}

		// Award daily login XP (default 5, override from xp_rules if set)
		const xpRule = await db.prepare(
			`SELECT amount FROM xp_rules WHERE reason = 'daily_login' LIMIT 1`
		).first<{ amount: number }>();
		const xp = xpRule?.amount ?? 5;

		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, created_at)
			 VALUES (?, ?, ?, 'daily_login', datetime('now'))`
		).bind(crypto.randomUUID(), userId, xp).run();

		// Update total XP + level (level = floor(totalXp/100) + 1)
		const existingXp = await db.prepare('SELECT total_xp, level FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
		const newTotal = (existingXp?.total_xp ?? 0) + xp;
		const newLevel = Math.floor(newTotal / 100) + 1;
		await db.prepare(
			`INSERT INTO user_xp (id, user_id, total_xp, level, created_at, updated_at)
			 VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
			 ON CONFLICT (user_id) DO UPDATE SET total_xp = ?, level = ?, updated_at = datetime('now')`
		).bind(crypto.randomUUID(), userId, newTotal, newLevel, newTotal, newLevel).run();

		// Streak: today's activity counts
		const todayStr = today;
		const streakRow = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();
		if (streakRow) {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().slice(0, 10);
			const lastDate = streakRow.last_activity_date;

			let newStreak = streakRow.current_streak;
			if (lastDate === todayStr) {
				// already counted today
			} else if (lastDate === yesterdayStr) {
				newStreak = streakRow.current_streak + 1;
			} else {
				newStreak = 1;
			}
			await db.prepare(
				`UPDATE user_streaks
				 SET current_streak = ?, longest_streak = MAX(longest_streak, ?), last_activity_date = ?,
				     updated_at = datetime('now')
				 WHERE user_id = ?`
			).bind(newStreak, newStreak, todayStr, userId).run();
		} else {
			await db.prepare(
				`INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_activity_date)
				 VALUES (?, ?, 1, 1, ?)`
			).bind(crypto.randomUUID(), userId, todayStr).run();
		}

		// Quest progress: earn_xp (track total XP earned today)
		try {
			await db.prepare(
				`UPDATE daily_quests SET progress = MIN(progress + ?, target)
				 WHERE user_id = ? AND quest_date = ? AND quest_key = 'earn_xp'`
			).bind(xp, userId, today).run();
		} catch { /* quest table may not exist yet */ }

		// Quest progress: streak (sync from current_streak)
		try {
			const streakRow2 = await db.prepare(
				'SELECT current_streak FROM user_streaks WHERE user_id = ?'
			).bind(userId).first<{ current_streak: number }>();
			if (streakRow2) {
				await db.prepare(
					`UPDATE daily_quests SET progress = MIN(?, target)
					 WHERE user_id = ? AND quest_date = ? AND quest_key = 'streak'`
				).bind(streakRow2.current_streak, userId, today).run();
			}
		} catch { /* quest table may not exist yet */ }

		// Log activity (keeps dashboard streak in sync)
		await db.prepare(
			`INSERT INTO user_activity_log (id, user_id, action, entity_type, created_at)
			 VALUES (?, ?, 'daily_login', 'session', datetime('now'))`
		).bind(crypto.randomUUID(), userId).run();

		return jsonResponse({ success: true, data: { claimed: true, already: false, xp } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

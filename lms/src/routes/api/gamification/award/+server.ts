import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

const STREAK_MILESTONES: { days: number; xp: number }[] = [
	{ days: 3, xp: 20 },
	{ days: 7, xp: 50 },
	{ days: 30, xp: 200 },
];

const XP_REASONS: Record<string, number> = {
	lesson_complete: 10,
	daily_login: 5,
	assignment_graded: 25,
	assessment_completed: 20,
	streak_milestone: 20,
};

/**
 * Award XP to a user. Creates xp_transaction row, upserts user_xp,
 * checks streak milestones, and recalculates level.
 */
async function awardXp(
	db: any,
	userId: string,
	amount: number,
	reason: string,
	referenceType?: string,
	referenceId?: string
): Promise<{ totalXp: number; level: number; newLevel: boolean; bonus: number; streakBonus: number }> {
	// 1. Insert transaction
	const txId = crypto.randomUUID();
	await db.prepare(
		`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
	).bind(txId, userId, amount, reason, referenceType || null, referenceId || null).run();

	// 2. Upsert user_xp
	const existingXp = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
	let totalXp = amount;
	let level = 1;
	if (existingXp) {
		totalXp = existingXp.total_xp + amount;
		const newLevel = Math.floor(totalXp / 100) + 1;
		await db.prepare(
			'UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime(\'now\') WHERE user_id = ?'
		).bind(totalXp, newLevel, userId).run();
		level = newLevel;
	} else {
		level = Math.floor(totalXp / 100) + 1;
		await db.prepare(
			'INSERT INTO user_xp (id, user_id, total_xp, level, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
		).bind(crypto.randomUUID(), userId, totalXp, level).run();
	}

	let newLevel = existingXp ? (Math.floor(totalXp / 100) + 1) > existingXp.level : level > 1;

	// 3. Update streak
	let streakBonus = 0;
	const today = new Date().toISOString().split('T')[0];
	const existingStreak = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();

	if (existingStreak) {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];
		const lastDate = existingStreak.last_activity_date;
		let newStreak = existingStreak.current_streak;

		if (lastDate === today) {
			// Already logged today — just keep streak
		} else if (lastDate === yesterdayStr) {
			newStreak += 1;
		} else {
			newStreak = 1;
		}

		// Check milestone bonuses
		for (const ms of STREAK_MILESTONES) {
			if (newStreak === ms.days) {
				streakBonus += ms.xp;
			}
		}

		const longest = Math.max(existingStreak.longest_streak, newStreak);
		await db.prepare(
			`UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ?, updated_at = datetime('now')
			 WHERE user_id = ?`
		).bind(newStreak, longest, today, userId).run();
	} else {
		await db.prepare(
			'INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_activity_date, updated_at) VALUES (?, ?, 1, 1, ?, datetime(\'now\'))'
		).bind(crypto.randomUUID(), userId, today).run();
	}

	let bonus = 0;
	if (streakBonus > 0) {
		// Award streak bonus XP
		const bonusTxId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id, created_at)
			 VALUES (?, ?, ?, 'streak_milestone', 'streak', ?, datetime('now'))`
		).bind(bonusTxId, userId, streakBonus, userId).run();

		totalXp += streakBonus;
		level = Math.floor(totalXp / 100) + 1;
		await db.prepare(
			'UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime(\'now\') WHERE user_id = ?'
		).bind(totalXp, level, userId).run();
		bonus = streakBonus;
	}

	return { totalXp, level, newLevel, bonus, streakBonus };
}

/** POST /api/gamification/award */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body: { amount?: number; reason?: string; reference_type?: string; reference_id?: string } = await request.json();

		const baseAmount = XP_REASONS[body.reason || ''] || body.amount || 10;
		if (!body.reason) {
			return jsonResponse({ success: false, error: 'reason is required' }, 400);
		}

		const result = await awardXp(db, userId, baseAmount, body.reason, body.reference_type, body.reference_id);

		return jsonResponse({
			success: true,
			data: {
				xpAwarded: baseAmount,
				totalXp: result.totalXp,
				level: result.level,
				bonus: result.bonus,
				streakBonus: result.streakBonus,
				newLevel: result.newLevel,
			}
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

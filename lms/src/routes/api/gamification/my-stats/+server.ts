import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

/** GET /api/gamification/my-stats — user level, XP, badges, streak, recent activity */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const xpRow = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
		const streakRow = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();

		const totalXp = xpRow?.total_xp ?? 0;
		const level = xpRow?.level ?? 1;
		const xpPerLevel = 100;
		const currentLevelXp = totalXp - ((level - 1) * xpPerLevel);
		const xpToNext = (level * xpPerLevel) - totalXp;

		// Badges earned
		const { results: earnedBadges } = await db.prepare(`
			SELECT b.id, b.name, b.description, b.icon, b.criteria_type, b.criteria_value, b.xp_reward, ub.earned_at
			FROM user_badges ub
			JOIN badges b ON b.id = ub.badge_id
			WHERE ub.user_id = ?
			ORDER BY ub.earned_at DESC
		`).bind(userId).all<any>();

		// Available (unlocked) badges the user hasn't earned yet
		const earnedIds = earnedBadges?.map((b: any) => b.id) || [];
		let availableBadges: any[] = [];
		if (earnedIds.length > 0) {
			const placeholders = earnedIds.map(() => '?').join(',');
			const { results: allBadges } = await db.prepare(
				`SELECT * FROM badges WHERE id NOT IN (${placeholders}) ORDER BY name ASC`
			).bind(...earnedIds).all<any>();
			availableBadges = allBadges || [];
		} else {
			const { results: allBadges } = await db.prepare('SELECT * FROM badges ORDER BY name ASC').all<any>();
			availableBadges = allBadges || [];
		}

		// Recent XP activity (last 20 transactions)
		const { results: recentActivity } = await db.prepare(`
			SELECT amount, reason, reference_type, reference_id, created_at
			FROM xp_transactions
			WHERE user_id = ?
			ORDER BY created_at DESC
			LIMIT 20
		`).bind(userId).all<any>();

		// Level progress to next level
		const nextLevelXp = (level) * xpPerLevel;

		return jsonResponse({
			success: true,
			data: {
				totalXp,
				level,
				currentLevelXp: Math.max(0, currentLevelXp),
				xpToNext: Math.max(0, xpToNext),
				nextLevelXp,
				xpPerLevel,
				streak: {
					current: streakRow?.current_streak ?? 0,
					longest: streakRow?.longest_streak ?? 0,
					lastActivityDate: streakRow?.last_activity_date ?? null,
				},
				badges: {
					earned: earnedBadges || [],
					available: availableBadges,
				},
				recentActivity: recentActivity || [],
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

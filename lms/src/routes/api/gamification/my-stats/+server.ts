import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/gamification/my-stats — user level, XP, streak */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const xpRow = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
		const streakRow = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();

		const totalXp = xpRow?.total_xp ?? 0;
		const level = xpRow?.level ?? 1;
		const currentLevelXp = (level - 1) * 100;
		const xpToNext = level * 100 - totalXp;

		return jsonResponse({
			success: true,
			data: {
				totalXp,
				level,
				currentLevelXp,
				xpToNext,
				streak: {
					current: streakRow?.current_streak ?? 0,
					longest: streakRow?.longest_streak ?? 0,
					lastActivityDate: streakRow?.last_activity_date ?? null,
				},
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/gamification/leaderboard?offeringId=X — top students by XP */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		const db = getDB(platform);

		// Auth optional — allow public read for leaderboard
		const token = getBearerToken(request);
		let currentUserId: string | null = null;
		if (token) {
			const session = await getSession(platform, token);
			if (session) currentUserId = session.user.id;
		}

		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId query parameter required' }, 400);
		}

		// Enrolled users in the offering, joined with user_xp for rank
		const { results } = await db.prepare(`
			SELECT
				u.id AS user_id,
				u.display_name,
				u.avatar_url,
				COALESCE(ux.total_xp, 0) AS total_xp,
				COALESCE(ux.level, 1) AS level,
				us.current_streak,
				ROW_NUMBER() OVER (ORDER BY COALESCE(ux.total_xp, 0) DESC) AS rank
			FROM enrollments e
			JOIN users u ON u.id = e.user_id
			LEFT JOIN user_xp ux ON ux.user_id = u.id
			LEFT JOIN user_streaks us ON us.user_id = u.id
			WHERE e.course_offering_id = ? AND e.status IN ('active', 'completed')
			ORDER BY total_xp DESC
			LIMIT 100
		`).bind(offeringId).all<any>();

		return jsonResponse({
			success: true,
			data: {
				leaderboard: (results || []).map((r: any, i: number) => ({
					rank: i + 1,
					userId: r.user_id,
					displayName: r.display_name,
					avatarUrl: r.avatar_url,
					totalXp: r.total_xp,
					level: r.level,
					currentStreak: r.current_streak ?? 0,
					isCurrentUser: r.user_id === currentUserId,
				})),
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

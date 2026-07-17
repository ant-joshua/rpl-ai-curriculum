import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/gamification/leaderboard?offeringId=X&period=daily|weekly|all&page=1&limit=20 — top students by XP */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');
		const period = url.searchParams.get('period') || 'all';
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
		const offset = (page - 1) * limit;

		const db = getDB(platform);

		// Auth optional — allow public read
		const token = getBearerToken(request);
		let currentUserId: string | null = null;
		if (token) {
			const session = await getSession(platform, token);
			if (session) currentUserId = session.user.id;
		}

		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId query parameter required' }, 400);
		}

		// Period filter: filter xp_transactions within period
		let periodWhere = '';
		if (period === 'daily') {
			periodWhere = "AND xp.created_at >= datetime('now', '-1 day')";
		} else if (period === 'weekly') {
			periodWhere = "AND xp.created_at >= datetime('now', '-7 days')";
		}

		// Get total enrolled users count
		const countResult = await db.prepare(`
			SELECT COUNT(DISTINCT u.id) as total
			FROM enrollments e
			JOIN users u ON u.id = e.user_id
			WHERE e.course_offering_id = ? AND e.status IN ('active', 'completed')
		`).bind(offeringId).first<{ total: number }>();
		const total = countResult?.total || 0;

		// Period-based: get XP earned within period, or total XP for 'all'
		let query: string;
		let countParams: unknown[];
		let params: unknown[];

		if (period === 'all') {
			query = `
				SELECT
					u.id AS user_id,
					u.display_name,
					u.avatar_url,
					COALESCE(ux.total_xp, 0) AS total_xp,
					COALESCE(ux.level, 1) AS level,
					us.current_streak
				FROM enrollments e
				JOIN users u ON u.id = e.user_id
				LEFT JOIN user_xp ux ON ux.user_id = u.id
				LEFT JOIN user_streaks us ON us.user_id = u.id
				WHERE e.course_offering_id = ? AND e.status IN ('active', 'completed')
				ORDER BY total_xp DESC
				LIMIT ? OFFSET ?
			`;
			params = [offeringId, limit, offset];
		} else {
			query = `
				SELECT
					u.id AS user_id,
					u.display_name,
					u.avatar_url,
					COALESCE(SUM(xp.amount), 0) AS period_xp,
					COALESCE(ux.total_xp, 0) AS total_xp,
					COALESCE(ux.level, 1) AS level,
					us.current_streak
				FROM enrollments e
				JOIN users u ON u.id = e.user_id
				LEFT JOIN xp_transactions xp ON xp.user_id = u.id ${periodWhere}
				LEFT JOIN user_xp ux ON ux.user_id = u.id
				LEFT JOIN user_streaks us ON us.user_id = u.id
				WHERE e.course_offering_id = ? AND e.status IN ('active', 'completed')
				GROUP BY u.id
				ORDER BY period_xp DESC
				LIMIT ? OFFSET ?
			`;
			params = [offeringId, limit, offset];
		}

		const { results } = await db.prepare(query).bind(...params).all<any>();

		return jsonResponse({
			success: true,
			data: {
				leaderboard: (results || []).map((r: any, i: number) => ({
					rank: offset + i + 1,
					userId: r.user_id,
					displayName: r.display_name,
					avatarUrl: r.avatar_url,
					totalXp: r.total_xp || 0,
					level: r.level || 1,
					currentStreak: r.current_streak ?? 0,
					periodXp: r.period_xp || 0,
					isCurrentUser: r.user_id === currentUserId,
				})),
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				}
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

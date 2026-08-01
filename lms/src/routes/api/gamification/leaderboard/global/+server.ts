import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { hasFeature } from '$lib/server/tenant-features';

/** GET /api/gamification/leaderboard/global — top 50 overall (optional ?period=daily|weekly|monthly) */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Tenant feature gate
		if (!hasFeature(locals?.tenant, 'leaderboard')) {
			return jsonResponse({ success: false, error: 'Fitur leaderboard tidak aktif', disabled: true }, 403);
		}

		// Auth optional
		const token = getBearerToken(request);
		let currentUserId: string | null = null;
		if (token) {
			const session = await getSession(platform, token);
			if (session) currentUserId = session.user.id;
		}

		const url = new URL(request.url);
		const period = url.searchParams.get('period') || 'all';

		let periodStart = '';
		if (period === 'daily') {
			periodStart = new Date().toISOString().slice(0, 10);
		} else if (period === 'weekly') {
			const d = new Date();
			d.setDate(d.getDate() - 7);
			periodStart = d.toISOString().slice(0, 10);
		} else if (period === 'monthly') {
			const d = new Date();
			d.setDate(d.getDate() - 30);
			periodStart = d.toISOString().slice(0, 10);
		}

		let results;
		if (periodStart) {
			// Period-based: XP earned in window
			({ results } = await db.prepare(`
				SELECT
					u.id AS user_id,
					u.display_name,
					u.avatar_url,
					COALESCE(SUM(t.amount), 0) AS total_xp,
					COALESCE(u.level, 1) AS level,
					us.current_streak,
					ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) AS rank
				FROM xp_transactions t
				JOIN users u ON u.id = t.user_id
				LEFT JOIN user_streaks us ON us.user_id = u.id
				WHERE t.amount > 0 AND date(t.created_at) >= ?
				GROUP BY u.id
				ORDER BY total_xp DESC
				LIMIT 50
			`).bind(periodStart).all<any>());
		} else {
			({ results } = await db.prepare(`
				SELECT
					u.id AS user_id,
					u.display_name,
					u.avatar_url,
					COALESCE(ux.total_xp, 0) AS total_xp,
					COALESCE(ux.level, 1) AS level,
					us.current_streak,
					ROW_NUMBER() OVER (ORDER BY COALESCE(ux.total_xp, 0) DESC) AS rank
				FROM user_xp ux
				JOIN users u ON u.id = ux.user_id
				LEFT JOIN user_streaks us ON us.user_id = u.id
				ORDER BY total_xp DESC
				LIMIT 50
			`).all<any>());
		}

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

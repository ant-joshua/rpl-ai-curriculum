import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/admin/quests/stats
 * Admin view: daily quest completion stats + per-user detail.
 * Query params:
 *   ?date=YYYY-MM-DD (default: today)
 *   ?detail=1 — include per-user rows
 */
export async function GET({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const user = locals.user;
		if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const db = getDB(platform);
		const url = new URL(request.url);
		const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
		const detail = url.searchParams.get('detail') === '1';

		// Summary per quest key for the date
		const { results: summary } = await db.prepare(
			`SELECT
				quest_key,
				COUNT(*) AS total_users,
				SUM(CASE WHEN progress >= target THEN 1 ELSE 0 END) AS completed,
				SUM(CASE WHEN claimed = 1 THEN 1 ELSE 0 END) AS claimed,
				SUM(xp_reward) AS total_xp_pending,
				AVG(progress) AS avg_progress
			 FROM daily_quests
			 WHERE quest_date = ?
			 GROUP BY quest_key
			 ORDER BY quest_key`
		).bind(date).all<any>();

		const { results: totals } = await db.prepare(
			`SELECT
				COUNT(DISTINCT user_id) AS active_users,
				SUM(CASE WHEN progress >= target AND claimed = 1 THEN xp_reward ELSE 0 END) AS xp_awarded_today,
				SUM(CASE WHEN progress >= target AND claimed = 0 THEN 1 ELSE 0 END) AS unclaimed_completed
			 FROM daily_quests
			 WHERE quest_date = ?`
		).bind(date).all<any>();

		let detailRows: any[] = [];
		if (detail) {
			const { results: rows } = await db.prepare(
				`SELECT
					q.user_id,
					u.display_name,
					u.email,
					q.quest_key,
					q.title,
					q.progress,
					q.target,
					q.xp_reward,
					q.claimed,
					q.quest_date
				 FROM daily_quests q
				 LEFT JOIN users u ON u.id = q.user_id
				 WHERE q.quest_date = ?
				 ORDER BY u.display_name ASC, q.quest_key ASC
				 LIMIT 200`
			).bind(date).all<any>();
			detailRows = rows || [];
		}

		return jsonResponse({
			success: true,
			data: {
				date,
				summary: summary || [],
				totals: totals?.[0] || null,
				detail: detailRows,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

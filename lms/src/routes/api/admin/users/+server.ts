import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams, buildSearchCondition } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const role = url.searchParams.get('role');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (role) { where += ' AND role = ?'; params.push(role); }

		const searchCond = buildSearchCondition(pag.search, ['display_name', 'email', 'username'], params, 'u');
		if (searchCond) where += ` AND (${searchCond})`;

		const countQuery = `SELECT COUNT(*) as total FROM users u ${where}`;
		const countResult = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const users = await db.prepare(`SELECT u.* FROM users u ${where} ORDER BY created_at DESC`).bind(...params).all<any>();
			const enriched = await enrichUsers(db, users.results || []);
			return jsonResponse({ success: true, data: enriched, total });
		}

		const sql = `SELECT u.* FROM users u ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
		const users = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all<any>();
		const enriched = await enrichUsers(db, users.results || []);

		return jsonResponse({
			success: true, data: enriched,
			pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) },
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

async function enrichUsers(db: any, users: any[]): Promise<any[]> {
	if (users.length === 0) return [];
	const userIds = users.map((u: any) => u.id);
	const placeholders = userIds.map(() => '?').join(',');

	const [xpRows, progressRows, projectRows] = await Promise.all([
		db.prepare(`SELECT user_id, COALESCE(total_xp, 0) as xp, level FROM user_xp WHERE user_id IN (${placeholders})`).bind(...userIds).all<any>(),
		db.prepare(`SELECT user_id, COUNT(*) as count FROM progress WHERE user_id IN (${placeholders}) AND completed = 1 GROUP BY user_id`).bind(...userIds).all<any>(),
		db.prepare(`SELECT user_id, COUNT(*) as count FROM project_completions WHERE user_id IN (${placeholders}) GROUP BY user_id`).bind(...userIds).all<any>(),
	]);

	const xpMap = new Map((xpRows.results || []).map((r: any) => [r.user_id, r]));
	const progressMap = new Map((progressRows.results || []).map((r: any) => [r.user_id, r]));
	const projectMap = new Map((projectRows.results || []).map((r: any) => [r.user_id, r]));

	return users.map(u => ({
		...u,
		xp: xpMap.get(u.id)?.xp || 0,
		level: xpMap.get(u.id)?.level || 1,
		completed_sessions: progressMap.get(u.id)?.count || 0,
		completed_projects: projectMap.get(u.id)?.count || 0,
	}));
}

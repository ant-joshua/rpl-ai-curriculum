import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;
		const action = url.searchParams.get('action');
		const userId = url.searchParams.get('userId');
		const entityType = url.searchParams.get('entityType');

		let where = 'WHERE 1=1';
		const params: any[] = [];

		if (action) { where += ' AND l.action = ?'; params.push(action); }
		if (userId) { where += ' AND l.user_id = ?'; params.push(userId); }
		if (entityType) { where += ' AND l.entity_type = ?'; params.push(entityType); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM user_activity_log l ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const sql = `SELECT l.*, u.display_name as user_name, u.username
			FROM user_activity_log l
			LEFT JOIN users u ON l.user_id = u.id
			${where}
			ORDER BY l.created_at DESC
			LIMIT ? OFFSET ?`;
		const logs = await db.prepare(sql).bind(...params, limit, offset).all();

		return jsonResponse({
			success: true,
			logs: logs.results || [],
			pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
		});
	} catch (e) {
		return jsonResponse({ success: false, error: 'Failed to fetch activity logs' }, 500);
	}
}

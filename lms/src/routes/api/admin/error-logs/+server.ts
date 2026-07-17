import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = (page - 1) * limit;
		const level = url.searchParams.get('level');
		const search = url.searchParams.get('search');
		const startDate = url.searchParams.get('startDate');
		const endDate = url.searchParams.get('endDate');

		let where = 'WHERE 1=1';
		const params: any[] = [];

		if (level) { where += ' AND e.level = ?'; params.push(level); }
		if (search) { where += ' AND (e.message LIKE ? OR e.url LIKE ? OR e.stack LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
		if (startDate) { where += ' AND e.created_at >= ?'; params.push(startDate); }
		if (endDate) { where += ' AND e.created_at <= ?'; params.push(endDate); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM error_logs e ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const sql = `SELECT e.*, u.display_name as user_name, u.username
			FROM error_logs e
			LEFT JOIN users u ON e.user_id = u.id
			${where}
			ORDER BY e.created_at DESC
			LIMIT ? OFFSET ?`;
		const logs = await db.prepare(sql).bind(...params, limit, offset).all();

		return jsonResponse({
			success: true,
			logs: logs.results || [],
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

// GET /api/admin/aiedu/generations — all generations (admin)
// ?user_id=&doc_type=&limit=
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const userId = url.searchParams.get('user_id') || '';
		const docType = url.searchParams.get('doc_type') || '';
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10) || 100, 500);

		let sql = `SELECT g.id, g.doc_type, g.subject, g.status, g.created_at, g.input, u.name AS user_name, u.email
			   FROM aiedu_generations g JOIN users u ON u.id = g.user_id WHERE 1=1`;
		const params: string[] = [];
		if (userId) { sql += ' AND g.user_id = ?'; params.push(userId); }
		if (docType) { sql += ' AND g.doc_type = ?'; params.push(docType); }
		sql += ' ORDER BY g.created_at DESC LIMIT ?';
		params.push(String(limit));

		const { results } = await db.prepare(sql).bind(...params).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

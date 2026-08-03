import { getDB, jsonResponse } from '$lib/server/d1';

// GET /api/admin/aiedu/documents — all bank documents (admin)
// ?source=&doc_type=&q=
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const source = url.searchParams.get('source') || '';
		const docType = url.searchParams.get('doc_type') || '';
		const q = url.searchParams.get('q') || '';

		let sql = `SELECT d.id, d.doc_type, d.subject, d.title, d.source, d.owner_id, d.created_at, u.name AS owner_name
			   FROM aiedu_documents d LEFT JOIN users u ON u.id = d.owner_id WHERE 1=1`;
		const params: string[] = [];
		if (source) { sql += ' AND d.source = ?'; params.push(source); }
		if (docType) { sql += ' AND d.doc_type = ?'; params.push(docType); }
		if (q) { sql += ' AND (d.title LIKE ? OR d.content LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
		sql += ' ORDER BY d.created_at DESC LIMIT 200';

		const { results } = await db.prepare(sql).bind(...params).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

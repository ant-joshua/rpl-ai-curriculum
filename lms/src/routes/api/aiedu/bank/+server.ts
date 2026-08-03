import { jsonResponse, getDB } from '$lib/server/d1';

// GET /api/aiedu/bank?type=cp&subject=Informatika — list curriculum documents
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const type = url.searchParams.get('type') || '';
		const subject = url.searchParams.get('subject') || '';
		const q = url.searchParams.get('q') || '';

		let sql = `SELECT id, doc_type, subject, title, created_at, source FROM aiedu_documents WHERE 1=1`;
		const params: string[] = [];
		if (type) { sql += ` AND doc_type = ?`; params.push(type); }
		if (subject) { sql += ` AND subject LIKE ?`; params.push(`%${subject}%`); }
		if (q) { sql += ` AND (title LIKE ? OR content LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }
		sql += ` ORDER BY created_at DESC LIMIT 50`;

		const { results } = await db.prepare(sql).bind(...params).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

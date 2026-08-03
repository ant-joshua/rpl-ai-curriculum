import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/bank?type=cp&subject=Informatika&mine=1 — list curriculum documents
// Public: seed + generated (shared). mine=1: only my generated docs.
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const type = url.searchParams.get('type') || '';
		const subject = url.searchParams.get('subject') || '';
		const q = url.searchParams.get('q') || '';
		const mine = url.searchParams.get('mine') === '1';

		// Auth for mine filter
		let myId: string | null = null;
		if (mine) {
			const token = getTokenFromRequest(request);
			if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
			const session = await getSession(platform, token).catch(() => null);
			if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
			myId = session.user.id;
		}

		let sql = `SELECT id, doc_type, subject, title, created_at, source, curriculum_id FROM aiedu_documents WHERE 1=1`;
		const params: string[] = [];
		if (mine && myId) { sql += ` AND owner_id = ?`; params.push(myId); }
		else { sql += ` AND (owner_id IS NULL OR source != 'generated')`; }
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

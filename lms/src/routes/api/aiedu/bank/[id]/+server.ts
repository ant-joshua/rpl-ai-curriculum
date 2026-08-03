import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/bank/[id] — full document content
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const doc = await db.prepare(
			`SELECT d.id, d.doc_type, d.subject, d.title, d.content, d.file_url, d.source, d.tags,
			        d.owner_id, d.curriculum_id, c.name AS curriculum_name
			 FROM aiedu_documents d
			 LEFT JOIN curricula c ON c.id = d.curriculum_id
			 WHERE d.id = ?`
		).bind(params.id).first<any>();

		if (!doc) return jsonResponse({ success: false, error: 'Document not found' }, 404);
		return jsonResponse({ success: true, data: doc });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// DELETE /api/aiedu/bank/[id] — delete own generated doc
export async function DELETE({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const doc = await db.prepare('SELECT * FROM aiedu_documents WHERE id = ?').bind(params.id).first<any>();
		if (!doc) return jsonResponse({ success: false, error: 'Document not found' }, 404);
		if (doc.source === 'seed') return jsonResponse({ success: false, error: 'Cannot delete seed document' }, 400);
		if (doc.owner_id && doc.owner_id !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		await db.prepare('DELETE FROM aiedu_documents WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

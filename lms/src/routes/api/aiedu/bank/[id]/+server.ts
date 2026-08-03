import { jsonResponse, getDB } from '$lib/server/d1';

// GET /api/aiedu/bank/[id] — full document content
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const doc = await db.prepare(
			'SELECT id, doc_type, subject, title, content, file_url, source, tags, created_at FROM aiedu_documents WHERE id = ?'
		).bind(params.id).first<any>();

		if (!doc) return jsonResponse({ success: false, error: 'Document not found' }, 404);
		return jsonResponse({ success: true, data: doc });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

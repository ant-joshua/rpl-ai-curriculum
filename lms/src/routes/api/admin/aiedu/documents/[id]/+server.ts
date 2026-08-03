import { getDB, jsonResponse } from '$lib/server/d1';

// DELETE /api/admin/aiedu/documents/[id] — admin delete any doc
export async function DELETE({ platform, params }: { platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const doc = await db.prepare('SELECT * FROM aiedu_documents WHERE id = ?').bind(params.id).first<any>();
		if (!doc) return jsonResponse({ success: false, error: 'Document not found' }, 404);

		await db.prepare('DELETE FROM aiedu_documents WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

/** DELETE /api/admin/lessons/[lessonId]/resources/[id] */
export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/')[6];
		await db.prepare('DELETE FROM lesson_resources WHERE id = ?').bind(id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM prerequisites WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		await db.prepare('DELETE FROM prerequisites WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

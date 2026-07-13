import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM content_blocks WHERE id = ?').bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM content_blocks WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };
		delete merged.created_at;

		await db.prepare(
			`UPDATE content_blocks SET type = ?, title = ?, body = ?, body_html = ?, meta = ?, order_index = ?, visibility = ?, updated_at = datetime('now')
			 WHERE id = ?`
		).bind(
			merged.type,
			merged.title,
			merged.body,
			merged.body_html,
			merged.meta,
			merged.order_index,
			merged.visibility,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM content_blocks WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM content_blocks WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		await db.prepare('DELETE FROM content_blocks WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

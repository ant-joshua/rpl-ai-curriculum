import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM admin_content WHERE id = ? AND type = ?').bind(params.id, 'exercise').first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		const data = JSON.parse(row.data || '{}');
		return jsonResponse({ success: true, data: { id: row.id, key: row.key, ...data, updated_at: row.updated_at, created_at: row.created_at } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM admin_content WHERE id = ? AND type = ?').bind(params.id, 'exercise').first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const current = JSON.parse(existing.data || '{}');
		const merged = { ...current, ...body };
		const data = JSON.stringify(merged);

		await db.prepare('UPDATE admin_content SET data = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(data, existing.id).run();
		return jsonResponse({ success: true, data: { id: existing.id, key: existing.key, ...merged } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		await db.prepare('DELETE FROM admin_content WHERE id = ? AND type = ?').bind(params.id, 'exercise').run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

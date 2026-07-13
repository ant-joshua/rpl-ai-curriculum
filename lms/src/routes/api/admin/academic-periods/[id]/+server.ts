import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM academic_periods WHERE id = ?').bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM academic_periods WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		// If setting this period active, deactivate all others first
		if (merged.is_active === 1 || merged.is_active === true) {
			await db.prepare('UPDATE academic_periods SET is_active = 0').run();
		}

		await db.prepare(
			`UPDATE academic_periods SET name = ?, type = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?`
		).bind(
			merged.name,
			merged.type,
			merged.start_date ?? null,
			merged.end_date ?? null,
			merged.is_active ? 1 : 0,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM academic_periods WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM academic_periods WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);
		await db.prepare('DELETE FROM academic_periods WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

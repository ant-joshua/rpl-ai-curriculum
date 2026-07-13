import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };
		delete merged.created_at;

		await db.prepare(
			`UPDATE lessons SET course_offering_id = ?, content_block_id = ?, title = ?, slug = ?, order_index = ?, duration_minutes = ?, is_optional = ?, status = ?, unlock_days = ?, updated_at = datetime('now')
			 WHERE id = ?`
		).bind(
			merged.course_offering_id,
			merged.content_block_id,
			merged.title,
			merged.slug,
			merged.order_index,
			merged.duration_minutes,
			merged.is_optional,
			merged.status,
			merged.unlock_days,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		await db.prepare('DELETE FROM lessons WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

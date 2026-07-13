import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { slug: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM courses WHERE slug = ?').bind(params.slug).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { slug: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM courses WHERE slug = ?').bind(params.slug).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };
		await db.prepare(
			'UPDATE courses SET title = ?, slug = ?, description = ?, short_description = ?, icon = ?, cover_image = ?, category = ?, level = ?, created_by = ?, updated_at = datetime(\'now\') WHERE id = ?'
		).bind(
			merged.title, merged.slug, merged.description, merged.short_description,
			merged.icon, merged.cover_image, merged.category, merged.level,
			merged.created_by, merged.id
		).run();
		return jsonResponse({ success: true, data: merged });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { slug: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		await db.prepare('DELETE FROM courses WHERE slug = ?').bind(params.slug).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

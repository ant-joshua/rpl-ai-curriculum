import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/admin/bundles — list all bundles */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results } = await db.prepare(`
			SELECT b.*, (SELECT COUNT(*) FROM bundle_items bi WHERE bi.bundle_id = b.id) AS item_count
			FROM bundles b ORDER BY b.created_at DESC
		`).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/admin/bundles — create bundle with items */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { title, slug, description, price, original_price, cover_icon, offering_ids } = body;

		if (!title) return jsonResponse({ success: false, error: 'title wajib' }, 400);
		if (!offering_ids || !Array.isArray(offering_ids) || offering_ids.length === 0) {
			return jsonResponse({ success: false, error: 'pilih minimal 1 kursus' }, 400);
		}

		const bundleId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO bundles (id, title, slug, description, price, original_price, cover_icon)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		).bind(bundleId, title, slug || null, description || null, price || 0, original_price || null, cover_icon || '📦').run();

		for (const oid of offering_ids) {
			await db.prepare(
				'INSERT INTO bundle_items (id, bundle_id, course_offering_id) VALUES (?, ?, ?)'
			).bind(crypto.randomUUID(), bundleId, oid).run();
		}

		return jsonResponse({ success: true, data: { id: bundleId } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

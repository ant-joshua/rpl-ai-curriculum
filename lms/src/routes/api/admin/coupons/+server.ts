import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results } = await db.prepare(`
			SELECT c.*, b.title AS bundle_title,
			       (SELECT COUNT(*) FROM coupon_redemptions cr WHERE cr.coupon_id = c.id) AS redemption_count
			FROM coupons c
			LEFT JOIN bundles b ON b.id = c.bundle_id
			ORDER BY c.created_at DESC LIMIT 100
		`).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { code, title, discount_type, discount_value, bundle_id, course_offering_id, max_uses, starts_at, expires_at } = body;

		if (!code || !discount_value) {
			return jsonResponse({ success: false, error: 'code dan discount_value wajib' }, 400);
		}

		const existing = await db.prepare('SELECT id FROM coupons WHERE code = ? COLLATE NOCASE').bind(code).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Kode kupon sudah ada' }, 400);
		}

		await db.prepare(`
			INSERT INTO coupons (id, code, title, discount_type, discount_value, bundle_id, course_offering_id, max_uses, starts_at, expires_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			crypto.randomUUID(), code.toUpperCase(), title || null,
			discount_type || 'percent', discount_value,
			bundle_id || null, course_offering_id || null,
			max_uses || 0, starts_at || null, expires_at || null
		).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}


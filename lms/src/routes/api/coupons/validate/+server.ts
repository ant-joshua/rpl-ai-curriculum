import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** POST /api/coupons/validate — check coupon code against target (bundle or offering), returns discount */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { code, bundleId, offeringId, price } = body;

		if (!code) return jsonResponse({ success: false, error: 'Kode kupon wajib' }, 400);

		const coupon = await db.prepare(`
			SELECT id, code, title, discount_type, discount_value, bundle_id, course_offering_id,
			       max_uses, used_count, starts_at, expires_at, is_active
			FROM coupons WHERE code = ? COLLATE NOCASE
		`).bind(code).first<any>();

		if (!coupon || coupon.is_active != 1) {
			return jsonResponse({ success: false, error: 'Kupon tidak valid' }, 400);
		}

		// Date window
		const now = Date.now();
		if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
			return jsonResponse({ success: false, error: 'Kupon belum aktif' }, 400);
		}
		if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
			return jsonResponse({ success: false, error: 'Kupon sudah kedaluwarsa' }, 400);
		}

		// Usage limit
		if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
			return jsonResponse({ success: false, error: 'Kupon sudah habis dipakai' }, 400);
		}

		// Scope: must match bundle OR offering (or global if both null)
		let scoped = true;
		if (coupon.bundle_id && coupon.bundle_id !== bundleId) scoped = false;
		if (coupon.course_offering_id && coupon.course_offering_id !== offeringId) scoped = false;
		if (!scoped) {
			return jsonResponse({ success: false, error: 'Kupon tidak berlaku untuk item ini' }, 400);
		}

		// Compute discount
		const basePrice = Number(price) || 0;
		let discount = 0;
		if (coupon.discount_type === 'percent') {
			discount = Math.round(basePrice * (Number(coupon.discount_value) / 100));
		} else {
			discount = Math.min(basePrice, Number(coupon.discount_value));
		}

		return jsonResponse({
			success: true,
			data: {
				id: coupon.id,
				code: coupon.code,
				title: coupon.title || coupon.code,
				discountType: coupon.discount_type,
				discountValue: coupon.discount_value,
				discount,
				finalPrice: Math.max(0, basePrice - discount),
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

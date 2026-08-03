import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { createSnapTransaction, getClientKey, formatAmount } from '$lib/server/midtrans';

/**
 * POST /api/payment/bundle/checkout
 * Create bundle order + Midtrans Snap token.
 * Body: { bundle_id, coupon_code? }
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session tidak valid' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { bundle_id, coupon_code } = body;
		if (!bundle_id) return jsonResponse({ success: false, error: 'bundle_id wajib' }, 400);

		// Bundle + items
		const bundle = await db.prepare('SELECT * FROM bundles WHERE id = ? AND is_active = 1').bind(bundle_id).first<any>();
		if (!bundle) return jsonResponse({ success: false, error: 'Paket tidak ditemukan' }, 404);
		if (bundle.price <= 0) return jsonResponse({ success: false, error: 'Paket ini gratis — pakai tombol daftar' }, 400);

		const { results: items } = await db.prepare(
			'SELECT course_offering_id FROM bundle_items WHERE bundle_id = ?'
		).bind(bundle_id).all();

		// Already enrolled all?
		const alreadyAll = await checkAllEnrolled(db, userId, items || []);
		if (alreadyAll) return jsonResponse({ success: false, error: 'Kamu sudah terdaftar di semua kursus paket ini' }, 400);

		// Coupon validation
		let couponId: string | null = null;
		let discount = 0;
		let finalPrice = bundle.price;
		if (coupon_code) {
			const coupon = await db.prepare(
				`SELECT id, discount_type, discount_value, bundle_id, max_uses, used_count, expires_at, is_active
				 FROM coupons WHERE code = ? COLLATE NOCASE`
			).bind(coupon_code).first<any>();
			if (!coupon || coupon.is_active != 1) return jsonResponse({ success: false, error: 'Kupon tidak valid' }, 400);
			if (coupon.bundle_id && coupon.bundle_id !== bundle_id) return jsonResponse({ success: false, error: 'Kupon tidak berlaku untuk paket ini' }, 400);
			if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return jsonResponse({ success: false, error: 'Kupon sudah kedaluwarsa' }, 400);
			if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) return jsonResponse({ success: false, error: 'Kupon sudah habis dipakai' }, 400);
			const usedByUser = await db.prepare(
				'SELECT id FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?'
			).bind(coupon.id, userId).first<any>();
			if (usedByUser) return jsonResponse({ success: false, error: 'Kamu sudah pakai kupon ini' }, 400);

			couponId = coupon.id;
			discount = coupon.discount_type === 'percent'
				? Math.round(bundle.price * (Number(coupon.discount_value) / 100))
				: Math.min(bundle.price, Number(coupon.discount_value));
			finalPrice = Math.max(0, bundle.price - discount);
		}

		// Student info
		const student = await db.prepare('SELECT display_name, email FROM users WHERE id = ?').bind(userId).first<any>();

		// Order id
		const orderId = `BUNDLE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

		// Create snap transaction
		const snap = await createSnapTransaction(
			platform,
			orderId,
			formatAmount(finalPrice),
			{ first_name: student?.display_name || 'Siswa', email: student?.email || '' },
			[{ id: bundle.id, name: `Paket: ${bundle.title}`, price: formatAmount(finalPrice), quantity: 1 }]
		);

		// Save order
		const orderId_uuid = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO bundle_orders (id, user_id, bundle_id, coupon_id, amount, discount, status, snap_token, order_id)
			 VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
		).bind(orderId_uuid, userId, bundle_id, couponId, finalPrice, discount, snap.token, orderId).run();

		return jsonResponse({
			success: true,
			data: {
				order_id: orderId,
				snap_token: snap.token,
				redirect_url: snap.redirect_url,
				client_key: getClientKey(platform),
				amount: finalPrice,
				discount,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Gagal membuat transaksi';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

async function checkAllEnrolled(db: any, userId: string, items: { course_offering_id: string }[]): Promise<boolean> {
	if (!items.length) return true;
	let all = true;
	for (const it of items) {
		const existing = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, it.course_offering_id).first();
		if (!existing) { all = false; break; }
	}
	return all;
}

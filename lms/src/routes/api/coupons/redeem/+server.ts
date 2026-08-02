import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** POST /api/coupons/redeem — apply coupon: enroll free bundle / record redemption */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { code, bundleId, offeringId } = body;

		if (!code) return jsonResponse({ success: false, error: 'Kode kupon wajib' }, 400);

		const coupon = await db.prepare(`
			SELECT id, code, discount_type, discount_value, bundle_id, course_offering_id,
			       max_uses, used_count, expires_at, is_active
			FROM coupons WHERE code = ? COLLATE NOCASE
		`).bind(code).first<any>();

		if (!coupon || coupon.is_active != 1) {
			return jsonResponse({ success: false, error: 'Kupon tidak valid' }, 400);
		}
		if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
			return jsonResponse({ success: false, error: 'Kupon sudah kedaluwarsa' }, 400);
		}
		if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
			return jsonResponse({ success: false, error: 'Kupon sudah habis dipakai' }, 400);
		}

		// Check user hasn't already used this coupon
		const prevUse = await db.prepare(
			'SELECT id FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?'
		).bind(coupon.id, userId).first<any>();
		if (prevUse) {
			return jsonResponse({ success: false, error: 'Kamu sudah pakai kupon ini' }, 400);
		}

		// For free enrollments: target must be bundle or offering
		let enrolled = 0;
		if (bundleId) {
			const { results: items } = await db.prepare(
				'SELECT course_offering_id FROM bundle_items WHERE bundle_id = ?'
			).bind(bundleId).all<{ course_offering_id: string }>();
			for (const it of items || []) {
				const existing = await db.prepare(
					'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
				).bind(userId, it.course_offering_id).first<any>();
				if (!existing) {
					await db.prepare(
						`INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at)
						 VALUES (?, ?, ?, 'student', 'active', datetime('now'))`
					).bind(crypto.randomUUID(), userId, it.course_offering_id).run();
					enrolled++;
				}
			}
		} else if (offeringId) {
			const existing = await db.prepare(
				'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
			).bind(userId, offeringId).first<any>();
			if (!existing) {
				await db.prepare(
					`INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at)
					 VALUES (?, ?, ?, 'student', 'active', datetime('now'))`
				).bind(crypto.randomUUID(), userId, offeringId).run();
				enrolled++;
			}
		}

		// Record redemption + bump counter
		await db.prepare(
			'INSERT INTO coupon_redemptions (id, coupon_id, user_id) VALUES (?, ?, ?)'
		).bind(crypto.randomUUID(), coupon.id, userId).run();
		await db.prepare(
			'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?'
		).bind(coupon.id).run();

		return jsonResponse({ success: true, data: { enrolled, code: coupon.code } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

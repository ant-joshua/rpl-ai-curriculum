import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** POST /api/bundles/[id]/enroll — enroll in all courses in a bundle (free bundles) */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const bundleId = url.pathname.split('/')[3];
		const userId = session.user.id;

		const bundle = await db.prepare(
			'SELECT id, price FROM bundles WHERE id = ? AND is_active = 1'
		).bind(bundleId).first<{ id: string; price: number }>();

		if (!bundle) return jsonResponse({ success: false, error: 'Bundle tidak ditemukan' }, 404);

		// Paid bundles must go through payment — this endpoint only for free (price = 0)
		if (bundle.price > 0) {
			return jsonResponse({ success: false, error: 'Bundle berbayar — selesaikan pembayaran dulu', needPayment: true }, 400);
		}

		// Get all offering IDs in bundle
		const { results: items } = await db.prepare(
			'SELECT course_offering_id FROM bundle_items WHERE bundle_id = ?'
		).bind(bundleId).all<{ course_offering_id: string }>();

		let enrolledCount = 0;
		for (const it of items || []) {
			const existing = await db.prepare(
				'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
			).bind(userId, it.course_offering_id).first<{ id: string }>();
			if (!existing) {
				await db.prepare(
					`INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at)
					 VALUES (?, ?, ?, 'student', 'active', datetime('now'))`
				).bind(crypto.randomUUID(), userId, it.course_offering_id).run();
				enrolledCount++;
			}
		}

		return jsonResponse({ success: true, data: { enrolledCount } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

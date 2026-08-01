import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/courses/[offeringId]/reviews — list reviews for a course */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.pathname.split('/')[3];

		const { results } = await db.prepare(`
			SELECT cr.id, cr.rating, cr.comment, cr.created_at,
			       u.display_name, u.avatar_url
			FROM course_reviews cr
			JOIN users u ON u.id = cr.user_id
			WHERE cr.course_offering_id = ?
			ORDER BY cr.created_at DESC
			LIMIT 50
		`).bind(offeringId).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/courses/[offeringId]/reviews — create/update own review */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.pathname.split('/')[3];
		const userId = session.user.id;
		const body = await request.json();
		const { rating, comment } = body;

		if (!rating || rating < 1 || rating > 5) {
			return jsonResponse({ success: false, error: 'rating 1-5 wajib' }, 400);
		}

		// Must be enrolled to review
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(userId, offeringId, 'active').first<any>();
		if (!enrollment) {
			return jsonResponse({ success: false, error: 'Kamu harus terdaftar di course ini untuk memberi review' }, 403);
		}

		await db.prepare(`
			INSERT INTO course_reviews (id, course_offering_id, user_id, rating, comment)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT (course_offering_id, user_id) DO UPDATE SET
				rating = excluded.rating,
				comment = excluded.comment,
				updated_at = datetime('now')
		`).bind(crypto.randomUUID(), offeringId, userId, rating, comment || null).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

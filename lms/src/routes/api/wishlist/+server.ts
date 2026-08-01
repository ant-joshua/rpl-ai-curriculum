import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** POST /api/wishlist/[offeringId]/toggle — add/remove from wishlist */
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

		// Check existing
		const existing = await db.prepare(
			'SELECT id FROM wishlist WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<{ id: string }>();

		if (existing) {
			await db.prepare('DELETE FROM wishlist WHERE id = ?').bind(existing.id).run();
			return jsonResponse({ success: true, data: { wishlisted: false } });
		}

		await db.prepare(
			'INSERT INTO wishlist (id, user_id, course_offering_id) VALUES (?, ?, ?)'
		).bind(crypto.randomUUID(), userId, offeringId).run();
		return jsonResponse({ success: true, data: { wishlisted: true } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** GET /api/wishlist — list current user's wishlist with course details */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const { results } = await db.prepare(`
			SELECT w.course_offering_id AS id, w.created_at,
			       co.name, co.status,
			       c.title AS course_title, c.slug AS course_slug,
			       c.icon AS course_icon, c.short_description,
			       (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id AND e.status = 'active') AS enrolled_count
			FROM wishlist w
			JOIN course_offerings co ON co.id = w.course_offering_id
			JOIN courses c ON c.id = co.course_id
			WHERE w.user_id = ?
			ORDER BY w.created_at DESC
		`).bind(userId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

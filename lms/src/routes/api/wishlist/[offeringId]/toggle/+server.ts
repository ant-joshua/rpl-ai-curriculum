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

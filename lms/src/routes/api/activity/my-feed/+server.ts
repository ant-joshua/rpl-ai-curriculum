import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/activity/my-feed?limit=20&cursor= — current user's personal feed */
export async function GET({ request, url, platform }: { request: Request; url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
		const cursor = url.searchParams.get('cursor');

		let result: any;
		if (cursor) {
			result = await db.prepare(
				`SELECT af.*, u.display_name, u.avatar_url, co.name as offering_name
				 FROM activity_feed af
				 LEFT JOIN users u ON u.id = af.user_id
				 LEFT JOIN course_offerings co ON co.id = af.offering_id
				 WHERE af.user_id = ? AND af.created_at < ?
				 ORDER BY af.created_at DESC
				 LIMIT ?`
			).bind(userId, cursor, limit).all<any>();
		} else {
			result = await db.prepare(
				`SELECT af.*, u.display_name, u.avatar_url, co.name as offering_name
				 FROM activity_feed af
				 LEFT JOIN users u ON u.id = af.user_id
				 LEFT JOIN course_offerings co ON co.id = af.offering_id
				 WHERE af.user_id = ?
				 ORDER BY af.created_at DESC
				 LIMIT ?`
			).bind(userId, limit).all<any>();
		}

		const activities = (result.results || []).map((r: any) => ({
			...r,
			metadata: r.metadata ? JSON.parse(r.metadata) : null,
		}));

		const nextCursor = activities.length === limit ? activities[activities.length - 1].created_at : null;

		return jsonResponse({ success: true, data: activities, nextCursor });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

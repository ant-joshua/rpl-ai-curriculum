import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/activity/feed?offeringId=X&limit=50&cursor= — paginated feed for an offering */
export async function GET({ request, url, platform }: { request: Request; url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const offeringId = url.searchParams.get('offeringId');
		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId query param is required' }, 400);
		}

		const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
		const cursor = url.searchParams.get('cursor');

		const db = getDB(platform);

		let result: any;
		if (cursor) {
			result = await db.prepare(
				`SELECT af.*, u.display_name, u.avatar_url
				 FROM activity_feed af
				 LEFT JOIN users u ON u.id = af.user_id
				 WHERE af.offering_id = ? AND af.created_at < ?
				 ORDER BY af.created_at DESC
				 LIMIT ?`
			).bind(offeringId, cursor, limit).all<any>();
		} else {
			result = await db.prepare(
				`SELECT af.*, u.display_name, u.avatar_url
				 FROM activity_feed af
				 LEFT JOIN users u ON u.id = af.user_id
				 WHERE af.offering_id = ?
				 ORDER BY af.created_at DESC
				 LIMIT ?`
			).bind(offeringId, limit).all<any>();
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

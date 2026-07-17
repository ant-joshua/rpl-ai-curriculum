import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/chat/[offeringId] — get chat messages (paginated, reverse-chronological)
 * Query: limit, before (id for cursor)
 * Returns newest first, client reverses for display
 */
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: { offeringId: string } }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const { offeringId } = params;
		const url = new URL(request.url);
		const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
		const before = url.searchParams.get('before'); // cursor: get messages before this id

		const db = getDB(platform);

		let sql = `SELECT cc.*, u.display_name, u.avatar_url
		           FROM course_chat cc
		           LEFT JOIN users u ON u.id = cc.user_id
		           WHERE cc.course_offering_id = ?`;
		const bindParams: any[] = [offeringId];

		if (before) {
			sql += ` AND cc.created_at < (SELECT created_at FROM course_chat WHERE id = ?)`;
			bindParams.push(before);
		}

		sql += ` ORDER BY cc.created_at DESC LIMIT ?`;
		bindParams.push(limit);

		const { results } = await db.prepare(sql).bind(...bindParams).all<any>();

		// Get total count
		const countRow = await db.prepare(
			'SELECT COUNT(*) as count FROM course_chat WHERE course_offering_id = ?'
		).bind(offeringId).first<{ count: number }>();

		return jsonResponse({
			success: true,
			data: (results || []).reverse(), // oldest first for display
			total: countRow?.count ?? 0,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/my/announcements
 * List announcements for offerings the current user is enrolled in.
 */
export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);

		// Get all active enrollments for the user
		const enrollments = await db
			.prepare('SELECT course_offering_id FROM enrollments WHERE user_id = ? AND status = ?')
			.bind(session.user.id, 'active')
			.all<any>();

		const offeringIds = (enrollments.results || []).map((e: any) => e.course_offering_id);

		if (offeringIds.length === 0) {
			return jsonResponse({ success: true, data: [] });
		}

		const placeholders = offeringIds.map(() => '?').join(',');
		// Also include announcements with no specific offering (global)
		const rows = await db
			.prepare(
				`SELECT a.*, u.display_name as creator_name, co.name as offering_name
				 FROM announcements a
				 LEFT JOIN users u ON a.created_by = u.id
				 LEFT JOIN course_offerings co ON a.course_offering_id = co.id
				 WHERE a.course_offering_id IN (${placeholders})
				 ORDER BY a.created_at DESC`
			)
			.bind(...offeringIds)
			.all<any>();

		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

		const data = (rows.results || []).map((a: any) => ({
			id: a.id,
			title: a.title,
			body: a.body,
			priority: a.priority,
			creatorName: a.creator_name || 'Admin',
			offeringName: a.offering_name || '',
			createdAt: a.created_at,
			isNew: a.created_at >= sevenDaysAgo,
		}));

		return jsonResponse({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

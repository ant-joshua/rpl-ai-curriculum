import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/my/live — live classes for user's enrolled courses */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const { results } = await db.prepare(`
			SELECT lc.id, lc.title, lc.description, lc.start_at, lc.duration_minutes,
			       lc.join_url, lc.recording_url, lc.status,
			       co.name AS offering_name,
			       u.display_name AS instructor_name
			FROM live_classes lc
			JOIN enrollments e ON e.course_offering_id = lc.course_offering_id AND e.user_id = ?
			JOIN course_offerings co ON co.id = lc.course_offering_id
			LEFT JOIN users u ON u.id = lc.instructor_id
			WHERE lc.status IN ('scheduled','live','ended')
			ORDER BY lc.start_at ASC
			LIMIT 50
		`).bind(userId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

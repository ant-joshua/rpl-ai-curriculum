import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/** GET /api/my/progress-summary?offeringId=X */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId query parameter required' }, 400);
		}

		// Count total published lessons for this offering
		const totalLesson = await db.prepare(
			'SELECT COUNT(*) as cnt FROM lessons WHERE course_offering_id = ? AND status = ?'
		).bind(offeringId, 'published').first<{ cnt: number }>();

		const totalLessons = totalLesson?.cnt ?? 0;

		// Count completed lessons for this user+offering
		const completedResult = await db.prepare(
			`SELECT COUNT(DISTINCT p.session_id) as cnt
			 FROM progress p
			 JOIN lessons l ON l.slug = p.session_id AND l.course_offering_id = ?
			 WHERE p.user_id = ? AND p.completed = 1`
		).bind(offeringId, userId).first<{ cnt: number }>();

		const completedLessons = completedResult?.cnt ?? 0;
		const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
		const isComplete = totalLessons > 0 && completedLessons >= totalLessons;

		return jsonResponse({
			success: true,
			data: {
				offeringId,
				totalLessons,
				completedLessons,
				percentage,
				isComplete,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

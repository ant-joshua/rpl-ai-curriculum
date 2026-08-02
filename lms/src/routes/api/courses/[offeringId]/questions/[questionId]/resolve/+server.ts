import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/**
 * POST /api/courses/[offeringId]/questions/[questionId]/resolve
 * Mark question resolved (asker or instructor)
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const parts = url.pathname.split('/');
		const questionId = parts[4];

		const question = await db.prepare(
			'SELECT id, user_id, course_offering_id FROM course_questions WHERE id = ?'
		).bind(questionId).first<any>();
		if (!question) return jsonResponse({ success: false, error: 'Pertanyaan tidak ditemukan' }, 404);

		const isOwner = question.user_id === session.user.id;
		const isInstructor = session.user.role === 'instructor' || session.user.role === 'admin' || session.user.role === 'superadmin';
		if (!isOwner && !isInstructor) return jsonResponse({ success: false, error: 'Tidak punya akses' }, 403);

		await db.prepare(
			'UPDATE course_questions SET is_resolved = CASE WHEN is_resolved = 1 THEN 0 ELSE 1 END, updated_at = datetime(\'now\') WHERE id = ?'
		).bind(questionId).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

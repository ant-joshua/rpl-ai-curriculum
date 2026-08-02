import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/lessons/[lessonId]/resources — list lesson resources (enrolled users) */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const lessonId = url.pathname.split('/')[3];

		// Check enrollment: lesson → offering → enrollment
		const lesson = await db.prepare(
			'SELECT course_offering_id FROM lessons WHERE id = ?'
		).bind(lessonId).first<{ course_offering_id: string }>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson tidak ditemukan' }, 404);

		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(session.user.id, lesson.course_offering_id, 'active').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Terdaftar dulu untuk lihat resources' }, 403);

		const { results } = await db.prepare(
			'SELECT id, title, file_url, file_type, file_size FROM lesson_resources WHERE lesson_id = ? ORDER BY created_at ASC'
		).bind(lessonId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

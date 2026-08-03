import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/instructor/courses — list own courses (instructor only)
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
		if (session.user.role !== 'instructor' && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Instructor only' }, 403);
		}

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT co.id, co.name, co.code, co.status, co.start_date, co.end_date,
			        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) AS enrolled_count,
			        (SELECT COUNT(*) FROM lessons l WHERE l.course_offering_id = co.id) AS lesson_count
			 FROM course_offerings co
			 WHERE co.instructor_id = ?
			 ORDER BY co.created_at DESC`
		).bind(session.user.id).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// POST /api/instructor/courses — create new course offering
// Body: { name, code?, start_date?, end_date? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
		if (session.user.role !== 'instructor' && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Instructor only' }, 403);
		}

		const body = await request.json();
		const { name, code, start_date, end_date } = body;
		if (!name || !name.trim()) return jsonResponse({ success: false, error: 'Course name is required' }, 400);

		const db = getDB(platform);
		const id = crypto.randomUUID();

		// Create base course entry
		const courseId = crypto.randomUUID();
		const defaultCur = await db.prepare(
			"SELECT id FROM curricula WHERE is_default = 1 AND is_active = 1 LIMIT 1"
		).first<any>();
		await db.prepare(
			'INSERT INTO courses (id, title, description, icon, slug, featured, curriculum_id) VALUES (?, ?, ?, ?, ?, 1, ?)'
		).bind(courseId, name, '', '📚', `course-${id.slice(0, 8)}`, defaultCur?.id || null).run();

		await db.prepare(
			`INSERT INTO course_offerings (id, course_id, name, code, instructor_id, start_date, end_date, status, curriculum_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)`
		).bind(
			id, courseId, name,
			code || `C-${id.slice(0, 6).toUpperCase()}`,
			session.user.id,
			start_date || null, end_date || null,
			defaultCur?.id || null
		).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

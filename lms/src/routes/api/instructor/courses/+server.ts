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
			`SELECT co.id, co.name, co.code, co.status, co.start_date, co.end_date, co.class_id,
			        c.name AS class_name,
			        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) AS enrolled_count,
			        (SELECT COUNT(*) FROM lessons l WHERE l.course_offering_id = co.id) AS lesson_count
			 FROM course_offerings co
			 LEFT JOIN classes c ON c.id = co.class_id
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
		const { name, code, start_date, end_date, class_id } = body;
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
			`INSERT INTO course_offerings (id, course_id, name, code, instructor_id, start_date, end_date, status, curriculum_id, class_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
		).bind(
			id, courseId, name,
			code || `C-${id.slice(0, 6).toUpperCase()}`,
			session.user.id,
			start_date || null, end_date || null,
			defaultCur?.id || null,
			class_id || null
		).run();

		// Auto-enroll class members if bound to a class
		let classStudents: any[] = [];
		if (class_id) {
			const res = await db.prepare(
				`SELECT cm.user_id FROM class_members cm WHERE cm.class_id = ? AND cm.status = 'active'`
			).bind(class_id).all<any>();
			classStudents = res.results || [];
			if (classStudents.length > 0) {
				const stmts = classStudents.map((m: any) =>
					db.prepare(
						`INSERT OR IGNORE INTO enrollments (id, user_id, course_offering_id, role, status)
						 VALUES (?, ?, ?, 'student', 'active')`
					).bind(crypto.randomUUID(), m.user_id, id)
				);
				await db.batch(stmts);
			}

			// Sync class members into the class-linked study group (best effort)
			try {
				const group = await db
					.prepare('SELECT id FROM study_groups WHERE class_id = ?')
					.bind(class_id)
					.first();
				if (group) {
					const gid = (group as any).id;
					const gm = classStudents.map((m: any) =>
						db.prepare(
							'INSERT OR IGNORE INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)'
						).bind(`gm-${gid}-${m.user_id}`, gid, m.user_id, 'member')
					);
					if (gm.length > 0) await db.batch(gm);
				}
			} catch {
				// best effort
			}
		}

		return jsonResponse({ success: true, data: { id, autoEnrolled: classStudents.length } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

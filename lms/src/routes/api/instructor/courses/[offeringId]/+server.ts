import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbQuery, cachedDbFirst } from '$lib/server/cache';

/**
 * GET /api/instructor/courses/[offeringId]
 * Returns full course detail: offering info, assignments, enrolled students, and submissions.
 * Verifies the instructor owns this offering (unless superadmin/admin).
 */
export async function GET({ params, platform, locals }: { params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;

		const offering = await cachedDbFirst<any>(
			db,
			'SELECT co.*, c.title AS course_title, c.slug AS course_slug FROM course_offerings co JOIN courses c ON c.id = co.course_id WHERE co.id = ?',
			[params.offeringId]
		);

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		// Verify ownership unless superadmin/admin
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden — you are not the instructor of this course' }, 403);
		}

		// Enrolled students
		const { results: enrollments } = await cachedDbQuery<any>(
			db,
			`SELECT e.*, u.display_name, u.email, u.username, u.avatar_url
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.role = 'student'
			 ORDER BY u.display_name ASC`,
			[params.offeringId]
		);

		// Assignments
		const { results: assignments } = await cachedDbQuery<any>(
			db,
			'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC',
			[params.offeringId]
		);

		// Assignment submissions
		const { results: submissions } = await cachedDbQuery<any>(
			db,
			`SELECT asub.*, u.display_name AS user_name
			 FROM assignment_submissions asub
			 JOIN users u ON u.id = asub.user_id
			 WHERE asub.assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?)
			 ORDER BY asub.submitted_at DESC`,
			[params.offeringId]
		);

		// Lessons count
		const { results: lessons } = await cachedDbQuery<any>(
			db,
			'SELECT id, title, slug, status FROM lessons WHERE course_offering_id = ? ORDER BY order_index ASC',
			[params.offeringId]
		);

		return jsonResponse({ success: true, data: {
			offering,
			enrollments: enrollments || [],
			assignments: assignments || [],
			submissions: submissions || [],
			lessons: lessons || [],
		}});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// PATCH /api/instructor/courses/[offeringId] — update course (name, status, dates)
// Body: { name?, status?, start_date?, end_date? }
export async function PATCH({ request, params, platform, locals }: { request: Request; params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const { name, status, start_date, end_date } = body;

		await db.prepare(
			'UPDATE course_offerings SET name = COALESCE(?, name), status = COALESCE(?, status), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), updated_at = datetime(\'now\') WHERE id = ?'
		).bind(name || null, status || null, start_date ?? null, end_date ?? null, params.offeringId).run();

		if (name) {
			await db.prepare('UPDATE courses SET title = ? WHERE id = ?').bind(name, offering.course_id).run();
		}

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

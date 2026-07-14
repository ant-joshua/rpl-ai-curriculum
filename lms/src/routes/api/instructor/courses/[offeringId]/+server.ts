import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/instructor/courses/[offeringId]
 * Returns full course detail: offering info, assignments, enrolled students, and submissions.
 * Verifies the instructor owns this offering (unless superadmin/admin).
 */
export async function GET({ params, platform, locals }: { params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;

		const offering = await db.prepare(
			'SELECT co.*, c.title AS course_title, c.slug AS course_slug FROM course_offerings co JOIN courses c ON c.id = co.course_id WHERE co.id = ?'
		).bind(params.offeringId).first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		// Verify ownership unless superadmin/admin
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden — you are not the instructor of this course' }, 403);
		}

		// Enrolled students
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, u.display_name, u.email, u.username, u.avatar_url
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.role = 'student'
			 ORDER BY u.display_name ASC`
		).bind(params.offeringId).all<any>();

		// Assignments
		const { results: assignments } = await db.prepare(
			'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Assignment submissions
		const { results: submissions } = await db.prepare(
			`SELECT asub.*, u.display_name AS user_name
			 FROM assignment_submissions asub
			 JOIN users u ON u.id = asub.user_id
			 WHERE asub.assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?)
			 ORDER BY asub.submitted_at DESC`
		).bind(params.offeringId).all<any>();

		// Lessons count
		const { results: lessons } = await db.prepare(
			'SELECT id, title, slug, status FROM lessons WHERE course_offering_id = ? ORDER BY order_index ASC'
		).bind(params.offeringId).all<any>();

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

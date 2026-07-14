import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/instructor/courses
 * Returns course offerings where the authenticated user is the instructor.
 * Superadmins and admins see all offerings (full access).
 */
export async function GET({ platform, locals }: { platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		let query: string;
		let params: any[];

		if (user.role === 'superadmin' || user.role === 'admin') {
			query = `
				SELECT co.*, c.title AS course_title, c.slug AS course_slug, c.icon AS course_icon,
					(SELECT COUNT(*) FROM enrollments WHERE course_offering_id = co.id AND role = 'student' AND status = 'active') AS student_count
				FROM course_offerings co
				JOIN courses c ON c.id = co.course_id
				ORDER BY co.name ASC
			`;
			params = [];
		} else {
			query = `
				SELECT co.*, c.title AS course_title, c.slug AS course_slug, c.icon AS course_icon,
					(SELECT COUNT(*) FROM enrollments WHERE course_offering_id = co.id AND role = 'student' AND status = 'active') AS student_count
				FROM course_offerings co
				JOIN courses c ON c.id = co.course_id
				WHERE co.instructor_id = ?
				ORDER BY co.name ASC
			`;
			params = [user.id];
		}

		const { results } = await db.prepare(query).bind(...params).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

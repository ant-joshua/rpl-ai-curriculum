import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/admin/discussions
 * Returns all discussions across all courses for admin view.
 * Supports filtering by course, status, search.
 */
export async function GET({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const courseId = url.searchParams.get('courseId');
		const status = url.searchParams.get('status'); // 'open' | 'resolved' | 'all'
		const search = url.searchParams.get('search');

		const user = locals.user;
		const isSuperAdmin = user.role === 'superadmin' || user.role === 'admin';

		// Base query: join threads with lessons, offerings, courses, users
		let query = `
			SELECT
				t.id, t.lesson_id, t.user_id, t.title, t.body,
				t.is_pinned, t.is_locked, t.is_resolved,
				t.created_at, t.updated_at,
				u.display_name, u.avatar_url,
				l.title AS lesson_title,
				co.name AS offering_name,
				c.title AS course_title,
				c.id AS course_id,
				(SELECT COUNT(*) FROM discussion_replies r WHERE r.thread_id = t.id) as reply_count
			FROM discussion_threads t
			JOIN lessons l ON l.id = t.lesson_id
			JOIN course_offerings co ON co.id = l.course_offering_id
			JOIN courses c ON c.id = co.course_id
			LEFT JOIN users u ON u.id = t.user_id
			WHERE 1=1
		`;
		const params: any[] = [];

		// Non-superadmin instructors see only their own offerings
		if (!isSuperAdmin) {
			query += ' AND co.instructor_id = ?';
			params.push(user.id);
		}

		if (courseId) {
			query += ' AND c.id = ?';
			params.push(courseId);
		}

		if (status === 'open') {
			query += ' AND t.is_resolved = 0';
		} else if (status === 'resolved') {
			query += ' AND t.is_resolved = 1';
		}

		if (search) {
			query += ' AND (t.title LIKE ? OR t.body LIKE ?)';
			params.push(`%${search}%`, `%${search}%`);
		}

		query += ' ORDER BY t.is_pinned DESC, t.created_at DESC LIMIT 100';

		const { results } = await db.prepare(query).bind(...params).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

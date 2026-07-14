import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ platform, request, url }: {
	platform: App.Platform;
	request: Request;
	url: URL;
}) {
	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(307, '/auth/login?redirect=/learn');

	const session = await getSession(platform, token);
	if (!session) throw redirect(307, '/auth/login?redirect=/learn');

	const db = getDB(platform);
	const userId = session.user.id;

	// Get all active offerings + enrollment status + instructor + student count + featured
	const { results: offerings } = await db
		.prepare(`
			SELECT co.id, co.name, co.code, co.start_date, co.end_date, co.status,
			       c.id AS course_id, c.title AS course_title, c.description AS course_description,
			       c.short_description, c.icon AS course_icon, c.category, c.level,
			       c.featured,
			       e.id IS NOT NULL AS is_enrolled,
			       u.display_name AS instructor_name,
			       (SELECT COUNT(*) FROM enrollments ee WHERE ee.course_offering_id = co.id AND ee.status = 'active') AS student_count
			FROM course_offerings co
			JOIN courses c ON c.id = co.course_id
			LEFT JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
			LEFT JOIN users u ON u.id = co.instructor_id
			ORDER BY c.featured DESC, co.start_date DESC
		`)
		.bind(userId)
		.all<any>();

	return {
		offerings: (offerings || []).map((o: any) => ({
			id: o.id,
			name: o.name,
			code: o.code,
			courseTitle: o.course_title,
			courseDescription: o.course_description,
			shortDescription: o.short_description,
			courseIcon: o.course_icon || '📚',
			category: o.category,
			level: o.level,
			featured: o.featured === 1 || o.featured === true,
			startDate: o.start_date,
			endDate: o.end_date,
			status: o.status,
			isEnrolled: o.is_enrolled === 1 || o.is_enrolled === true,
			instructorName: o.instructor_name || '—',
			studentCount: o.student_count ?? 0
		})),
		userName: session.user.name || 'Student',
		userId: session.user.id,
		token
	};
}

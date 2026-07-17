import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, url, platform }: {
	request: Request; url: URL; platform: App.Platform
}): Promise<Response> {
	try {
		const token = getBearerToken(request) || url.searchParams.get('token');
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session || !['admin', 'superadmin'].includes(session.user.role))
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);

		const db = getDB(platform);
		const startDate = url.searchParams.get('start') || '2000-01-01';
		const endDate = url.searchParams.get('end') || '2099-12-31';

		const { results: courses } = await db.prepare(
			`SELECT co.id, co.name AS offering_name,
			        c.title AS course_title, c.icon AS course_icon,
			        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id) AS total_enrollments,
			        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id AND e.status = 'completed') AS completed_enrollments,
			        (SELECT AVG(g.score / g.max_score) * 100 FROM gradebook g WHERE g.course_offering_id = co.id AND g.score IS NOT NULL AND g.max_score > 0) AS avg_grade
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 WHERE co.status = 'active'
			 ORDER BY total_enrollments DESC`
		).all<any>();

		const data = (courses || []).map(c => ({
			id: c.id,
			name: c.offering_name || c.course_title,
			icon: c.course_icon || '📚',
			totalEnrollments: c.total_enrollments ?? 0,
			completedEnrollments: c.completed_enrollments ?? 0,
			completionRate: c.total_enrollments > 0 ? Math.round(((c.completed_enrollments ?? 0) / c.total_enrollments) * 100) : 0,
			avgGrade: Math.round(c.avg_grade || 0),
		}));

		return jsonResponse({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

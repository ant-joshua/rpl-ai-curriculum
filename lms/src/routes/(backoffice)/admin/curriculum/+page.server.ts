import { redirect } from '@sveltejs/kit';
import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform }) => {
	if (!platform) throw redirect(302, '/admin');

	const token = getBearerToken(request);
	if (!token) throw redirect(302, '/admin');

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/admin');

	const db = getDB(platform);
	const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
	if (!user || !['superadmin', 'admin'].includes(user.role)) {
		throw redirect(302, '/admin');
	}

	const offerings = await db
		.prepare('SELECT id, name, code, status FROM course_offerings ORDER BY name ASC')
		.all<any>();

	const lessons = await db
		.prepare(
			`SELECT l.id, l.title, l.slug, l.course_offering_id, l.order_index, l.status, l.is_optional, l.duration_minutes,
			 co.name as offering_name
			 FROM lessons l
			 LEFT JOIN course_offerings co ON co.id = l.course_offering_id
			 ORDER BY l.course_offering_id, l.order_index ASC`
		)
		.all<any>();

	return {
		offerings: offerings.results || [],
		lessons: lessons.results || [],
	};
};

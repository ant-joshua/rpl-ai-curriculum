import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, '/login?redirect=/my/chat');

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/login?redirect=/my/chat');

	const db = getDB(platform);
	const userId = session.user.id;

	const { results: courses } = await db.prepare(
		`SELECT co.id, co.name AS offering_name, c.title AS course_title, c.icon AS course_icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ? AND e.status IN ('active', 'completed')
		 ORDER BY co.name ASC`
	).bind(userId).all<any>();

	return {
		courses: (courses || []).map(c => ({
			id: c.id,
			offeringName: c.offering_name,
			courseTitle: c.course_title,
			courseIcon: c.course_icon || '📚',
		})),
		token,
	};
};

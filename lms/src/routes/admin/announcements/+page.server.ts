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
		.prepare('SELECT id, name, code FROM course_offerings ORDER BY name')
		.all<any>();

	const announcements = await db
		.prepare(
			`SELECT a.*, u.display_name as creator_name
			 FROM announcements a
			 LEFT JOIN users u ON a.created_by = u.id
			 ORDER BY a.created_at DESC`
		)
		.all<any>();

	return {
		announcements: announcements.results || [],
		offerings: offerings.results || [],
	};
};

import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbQuery } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, locals }) => {
	const user = locals.user || (await (async () => {
		const token = getTokenFromRequest(request);
		if (!token || !platform) return null;
		const s = await getSession(platform, token);
		return s?.user || null;
	})());

	if (!user) throw redirect(302, '/login?redirect=/my/chat');

	const db = getDB(platform);
	const userId = user.id;

	const { results: courses } = await cachedDbQuery<any>(
		db,
		`SELECT co.id, co.name AS offering_name, c.title AS course_title, c.icon AS course_icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ? AND e.status IN ('active', 'completed')
		 ORDER BY co.name ASC`,
		[userId],
		60_000
	);

	return {
		courses: (courses || []).map((c: any) => ({
			id: c.id,
			offeringName: c.offering_name,
			courseTitle: c.course_title,
			courseIcon: c.course_icon || '📚',
		})),
	};
};

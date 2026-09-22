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

	if (!user) throw redirect(302, '/login?redirect=/my/planner');

	const userId = user.id;
	const db = getDB(platform);

	// Fetch active enrollments with course info (cached 60s)
	const { results: enrollments } = await cachedDbQuery<any>(
		db,
		`SELECT e.course_offering_id AS offering_id, co.name AS offering_name,
		        c.id AS course_id, c.title AS course_title, c.icon AS course_icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ? AND e.status = 'active'
		 ORDER BY e.enrolled_at DESC`,
		[userId],
		60_000
	);

	return {
		enrollments: enrollments || [],
	};
};

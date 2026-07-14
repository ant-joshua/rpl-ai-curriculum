import { redirect } from '@sveltejs/kit';
import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';
import type { PageServerLoad } from './$types';
import { modules } from '$lib/stores/modules';

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

	// All content_blocks with their linked lesson info
	const cbResult = await db
		.prepare(`
			SELECT
				cb.*,
				l.id as lesson_id,
				l.course_offering_id as lesson_offering_id,
				l.title as lesson_title,
				l.slug as lesson_slug,
				l.status as lesson_status,
				l.order_index as lesson_order
			FROM content_blocks cb
			LEFT JOIN lessons l ON l.content_block_id = cb.id
			ORDER BY cb.order_index ASC
		`)
		.all<any>();

	// All lessons (for linking UI)
	const lessonsResult = await db
		.prepare(`
			SELECT l.*, co.name as offering_name
			FROM lessons l
			LEFT JOIN course_offerings co ON co.id = l.course_offering_id
			ORDER BY l.order_index ASC
		`)
		.all<any>();

	// All course offerings
	const offeringsResult = await db
		.prepare('SELECT id, name, code, course_id FROM course_offerings ORDER BY name ASC')
		.all<any>();

	return {
		modules: modules.map(m => ({
			index: m.index,
			slug: m.slug,
			dirName: m.dirName,
			title: m.title,
			description: m.description,
			level: m.level,
			sessions: m.sessions.map(s => ({ id: s.id, title: s.title }))
		})),
		contentBlocks: cbResult.results || [],
		lessons: lessonsResult.results || [],
		offerings: offeringsResult.results || [],
	};
};

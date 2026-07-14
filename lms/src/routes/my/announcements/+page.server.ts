import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) {
		throw redirect(302, '/login?redirect=/my/announcements');
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, '/login?redirect=/my/announcements');
	}

	const db = getDB(platform);
	const userId = session.user.id;

	// Get enrolled offerings
	const { results: enrollments } = await db.prepare(
		'SELECT course_offering_id FROM enrollments WHERE user_id = ? AND status = ?'
	).bind(userId, 'active').all<any>();

	const offeringIds = (enrollments || []).map((e: any) => e.course_offering_id);

	let announcements: any[] = [];

	if (offeringIds.length > 0) {
		const placeholders = offeringIds.map(() => '?').join(',');
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

		const { results: rows } = await db.prepare(
			`SELECT a.*, u.display_name as creator_name, co.name as offering_name
			 FROM announcements a
			 LEFT JOIN users u ON a.created_by = u.id
			 LEFT JOIN course_offerings co ON a.course_offering_id = co.id
			 WHERE a.course_offering_id IN (${placeholders})
			 ORDER BY a.created_at DESC`
		).bind(...offeringIds).all<any>();

		announcements = (rows || []).map((a: any) => ({
			id: a.id,
			title: a.title,
			body: a.body,
			priority: a.priority,
			creatorName: a.creator_name || 'Admin',
			offeringName: a.offering_name || '',
			offeringId: a.course_offering_id,
			createdAt: a.created_at,
			isNew: a.created_at >= sevenDaysAgo,
		}));
	}

	// Get offerings info for filter
	const { results: offeringInfo } = await db.prepare(
		'SELECT id, name FROM course_offerings WHERE id IN (' +
		(offeringIds.length > 0 ? offeringIds.map(() => '?').join(',') : "'__none__'") +
		')'
	).bind(...offeringIds).all<any>();

	return {
		announcements,
		offerings: offeringInfo || [],
		token,
	};
};

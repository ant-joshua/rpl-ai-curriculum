import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url, params }) => {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, '/login?redirect=/my/chat/' + params.offeringId);

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/login?redirect=/my/chat/' + params.offeringId);

	const db = getDB(platform);

	// Get offering name
	const offering = await db.prepare(
		'SELECT name FROM course_offerings WHERE id = ?'
	).bind(params.offeringId).first<{ name: string }>();

	// Get user profile
	const user = await db.prepare(
		'SELECT id, display_name, avatar_url FROM users WHERE id = ?'
	).bind(session.user.id).first<any>();

	return {
		offeringId: params.offeringId,
		offeringName: offering?.name || 'Kursus',
		user: {
			id: session.user.id,
			name: user?.display_name || session.user.name || 'Siswa',
			avatar_url: user?.avatar_url || '',
		},
		token,
	};
};

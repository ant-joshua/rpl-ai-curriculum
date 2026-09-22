import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbFirst } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, params, locals }) => {
	const user = locals.user || (await (async () => {
		const token = getTokenFromRequest(request);
		if (!token || !platform) return null;
		const s = await getSession(platform, token);
		return s?.user || null;
	})());

	if (!user) throw redirect(302, '/login?redirect=/my/chat/' + params.offeringId);

	const db = getDB(platform);

	// Get offering name (cached 60s)
	const offering = await cachedDbFirst<{ name: string }>(
		db,
		'SELECT name FROM course_offerings WHERE id = ?',
		[params.offeringId],
		60_000
	);

	// Get user profile
	const userProfile = await cachedDbFirst<any>(
		db,
		'SELECT id, display_name, avatar_url FROM users WHERE id = ?',
		[user.id],
		60_000
	);

	return {
		offeringId: params.offeringId,
		offeringName: offering?.name || 'Kursus',
		user: {
			id: user.id,
			name: userProfile?.display_name || user.name || 'Siswa',
			avatar_url: userProfile?.avatar_url || '',
		},
	};
};

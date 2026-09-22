import { getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbFirst } from '$lib/server/cache';
import { redirect } from '@sveltejs/kit';

export async function load({ params, request, platform, locals }: {
	params: Record<string, string>;
	request: Request;
	platform: App.Platform;
	locals: App.Locals;
}) {
	const user = locals.user || (await (async () => {
		const token = getTokenFromRequest(request);
		if (!token || !platform) return null;
		const s = await getSession(platform, token);
		return s?.user || null;
	})());

	if (!user) throw redirect(302, `/login?redirect=/tryout/${params.offeringId}`);

	const db = getDB(platform);
	const userId = user.id;
	const offeringId = params.offeringId;

	const offering = await cachedDbFirst<any>(
		db,
		'SELECT co.*, c.title as course_title, c.icon as course_icon FROM course_offerings co LEFT JOIN courses c ON c.id = co.course_id WHERE co.id = ?',
		[offeringId],
		60_000
	);

	if (!offering) throw redirect(302, '/catalog');

	const enrollment = await cachedDbFirst<any>(
		db,
		'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?',
		[userId, offeringId, 'active'],
		30_000
	);

	return {
		offering,
		isEnrolled: !!enrollment,
		userId,
	};
}

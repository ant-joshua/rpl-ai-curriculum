import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ params, request, platform, url }: {
	params: Record<string, string>;
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, `/login?redirect=/tryout/${params.offeringId}`);

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, `/login?redirect=/tryout/${params.offeringId}`);

	const db = getDB(platform);
	const userId = session.user.id;
	const offeringId = params.offeringId;

	const offering = await db.prepare(
		'SELECT co.*, c.title as course_title, c.icon as course_icon FROM course_offerings co LEFT JOIN courses c ON c.id = co.course_id WHERE co.id = ?'
	).bind(offeringId).first<any>();

	if (!offering) throw redirect(302, '/catalog');

	const enrollment = await db.prepare(
		'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
	).bind(userId, offeringId, 'active').first<any>();

	return {
		offering,
		isEnrolled: !!enrollment,
		token,
		userId,
	};
}

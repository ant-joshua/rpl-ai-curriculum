import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function load({ params, request, platform, url }: {
	params: Record<string, string>;
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	// Auth check
	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) {
		throw redirect(302, `/login?redirect=/learn/${params.offeringId}`);
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, `/login?redirect=/learn/${params.offeringId}`);
	}

	const db = getDB(platform);
	const userId = session.user.id;
	const offeringId = params.offeringId;

	// Load offering
	const offering = await db.prepare(
		'SELECT * FROM course_offerings WHERE id = ?'
	).bind(offeringId).first<any>();

	if (!offering) {
		throw redirect(302, '/learn');
	}

	// Load course
	const course = await db.prepare(
		'SELECT * FROM courses WHERE id = ?'
	).bind(offering.course_id).first<any>();

	// Load instructor info
	let instructor = null;
	if (offering.instructor_id) {
		instructor = await db.prepare(
			'SELECT id, display_name, email FROM users WHERE id = ?'
		).bind(offering.instructor_id).first<any>();
	}

	// Load user enrollment status
	const enrollment = await db.prepare(
		'SELECT * FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
	).bind(userId, offeringId).first<any>();

	return {
		offering,
		course,
		instructor,
		enrollment,
		token,
		userId,
	};
}

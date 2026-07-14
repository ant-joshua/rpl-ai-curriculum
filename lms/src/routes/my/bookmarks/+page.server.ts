import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ request, platform, url }: {
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) {
		throw redirect(302, '/auth/login?redirect=/my/bookmarks');
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, '/auth/login?redirect=/my/bookmarks');
	}

	const userId = session.user.id;
	const db = getDB(platform);

	const { results } = await db.prepare(`
		SELECT b.*, l.title AS lesson_title, l.slug AS lesson_slug, l.duration_minutes,
		       co.name AS offering_name, co.id AS offering_id, co.course_id,
		       c.title AS course_title
		FROM bookmarks b
		JOIN lessons l ON l.id = b.lesson_id
		JOIN course_offerings co ON co.id = l.course_offering_id
		JOIN courses c ON c.id = co.course_id
		WHERE b.user_id = ?
		ORDER BY b.created_at DESC
	`).bind(userId).all<any>();

	return {
		bookmarks: results || [],
		token,
	};
}

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
		throw redirect(302, '/login?redirect=/my/profile');
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, '/login?redirect=/my/profile');
	}

	const userId = session.user.id;
	const db = getDB(platform);

	// Fetch full profile
	const profile = await db.prepare(
		`SELECT u.id, u.display_name, u.avatar_url, u.role, u.is_active, u.created_at,
		        ou.email, ou.name AS oauth_name
		 FROM users u
		 LEFT JOIN oauth_users ou ON ou.id = u.id
		 WHERE u.id = ?`
	).bind(userId).first<any>();

	const displayName = profile?.display_name || profile?.oauth_name || '';
	const email = profile?.email || '';
	const avatarUrl = profile?.avatar_url || '';
	const role = profile?.role || 'student';
	const createdAt = profile?.created_at || '';

	// Count enrolled courses
	const enrollmentCount = await db.prepare(
		`SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = 'active'`
	).bind(userId).first<{ count: number }>();

	const enrolledCoursesCount = enrollmentCount?.count ?? 0;

	// Get last login — most recent session creation for this user
	const lastSession = await db.prepare(
		`SELECT created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
	).bind(userId).first<{ created_at: string }>();

	const lastLogin = lastSession?.created_at || null;

	return {
		displayName,
		email,
		avatarUrl,
		role,
		createdAt,
		enrolledCoursesCount,
		lastLogin,
		token,
	};
};

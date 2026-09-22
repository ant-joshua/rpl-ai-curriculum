import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbFirst } from '$lib/server/cache';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, locals }) => {
	const user = locals.user || (await (async () => {
		const token = getTokenFromRequest(request);
		if (!token || !platform) return null;
		const s = await getSession(platform, token);
		return s?.user || null;
	})());

	if (!user) throw redirect(302, '/login?redirect=/my/profile');

	const userId = user.id;
	const db = getDB(platform);

	// Fetch full profile (cached 60s)
	const profile = await cachedDbFirst<any>(
		db,
		`SELECT u.id, u.display_name, u.avatar_url, u.role, u.is_active, u.created_at,
		        u.totp_verified, u.password_hash, u.email_verified,
		        ou.email, ou.name AS oauth_name
		 FROM users u
		 LEFT JOIN oauth_users ou ON ou.id = u.id
		 WHERE u.id = ?`,
		[userId],
		60_000
	);

	const displayName = profile?.display_name || profile?.oauth_name || user.name || '';
	const email = profile?.email || (user as any).email || '';
	const avatarUrl = profile?.avatar_url || '';
	const role = profile?.role || user.role || 'student';
	const createdAt = profile?.created_at || '';
	const totpVerified = profile?.totp_verified === 1;
	const hasPassword = !!profile?.password_hash;
	const emailVerified = profile?.email_verified === 1;

	// Count enrolled courses (cached 60s)
	const enrollmentCount = await cachedDbFirst<{ count: number }>(
		db,
		`SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = 'active'`,
		[userId],
		60_000
	);

	const enrolledCoursesCount = enrollmentCount?.count ?? 0;

	// Get last login (cached 60s)
	const lastSession = await cachedDbFirst<{ created_at: string }>(
		db,
		`SELECT created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
		[userId],
		60_000
	);

	const lastLogin = lastSession?.created_at || null;

	return {
		displayName,
		email,
		avatarUrl,
		role,
		createdAt,
		enrolledCoursesCount,
		lastLogin,
		totpVerified,
		hasPassword,
		emailVerified,
	};
};

import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function load({ request, platform }: { request: Request; platform: App.Platform }) {
	const token = getBearerToken(request);
	if (!token) { throw redirect(302, '/login'); }
	
	const session = await getSession(platform, token);
	if (!session) { throw redirect(302, '/login'); }

	// Role is stored in the users table, not OAuthUser
	const db = getDB(platform);
	const user = await db
		.prepare('SELECT * FROM users WHERE id = ?')
		.bind(session.user.id)
		.first<any>();

	if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'instructor' && user.role !== 'ta')) {
		throw redirect(302, '/dashboard');
	}

	return { user, role: user.role };
}

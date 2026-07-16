import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function load({ request, platform, url }: {
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, '/login?redirect=' + url.pathname);

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/login?redirect=' + url.pathname);

	const db = getDB(platform);

	// Get user profile with avatar
	const user = await db.prepare(
		`SELECT id, display_name, avatar_url, role, email
		 FROM users WHERE id = ?`
	).bind(session.user.id).first<any>();

	return {
		user: {
			id: session.user.id,
			name: user?.display_name || session.user.name || session.user.email?.split('@')[0] || 'Siswa',
			avatar_url: user?.avatar_url || '',
			role: user?.role || 'student',
		},
		token,
	};
}

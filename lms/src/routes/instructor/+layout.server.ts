import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbFirst } from '$lib/server/cache';

export async function load({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: App.Locals;
}) {
	const sessionUser = locals.user || (await (async () => {
		const token = getTokenFromRequest(request);
		if (!token || !platform) return null;
		const s = await getSession(platform, token);
		return s?.user || null;
	})());

	if (!sessionUser) throw redirect(302, '/login?redirect=/instructor');

	const db = getDB(platform);
	const user = await cachedDbFirst<any>(
		db,
		`SELECT id, display_name, avatar_url, role, email FROM users WHERE id = ?`,
		[sessionUser.id],
		60_000
	);

	if (!user || !['admin', 'superadmin', 'instructor', 'ta'].includes(user.role)) {
		throw redirect(302, '/dashboard');
	}

	return {
		user: {
			id: sessionUser.id,
			name: user.display_name || sessionUser.name || 'Instruktur',
			avatar_url: user.avatar_url || '',
			role: user.role || 'instructor',
		},
	};
}

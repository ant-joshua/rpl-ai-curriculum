import { redirect } from '@sveltejs/kit';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

const PUBLIC_PATHS = new Set([
	'/',
	'/feed',
	'/feed.json',
	'/feed.xml',
	'/certificate',
	'/sitemap.xml',
	'/robots.txt',
	'/login',
	'/auth/login',
	'/register',
	'/auth/register',
	'/register/instructor',
	'/reset-password',
	'/forgot-password',
	'/catalog',
	'/about',
	'/contact',
	'/privacy',
	'/terms',
	'/pricing',
	'/offline'
]);

const PUBLIC_PREFIXES = [
	'/certificate/',
	'/certificates/',
	'/announcements',
	'/ai-course',
	'/slides',
	'/content',
	'/practice',
	'/badges',
	'/leaderboard',
	'/explore',
	'/t/'
];

function isPublicPath(pathname: string): boolean {
	if (PUBLIC_PATHS.has(pathname)) return true;
	return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export async function load({ request, platform, url }: {
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	const isApi = url.pathname.startsWith('/api/');
	const isPublic = isPublicPath(url.pathname);

	if (isApi) {
		return {};
	}

	const token = getTokenFromRequest(request);

	// Try to resolve user session if token is present
	let sessionUser: any = null;
	if (token && platform?.env?.DB) {
		try {
			const session = await getSession(platform, token);
			if (session) {
				sessionUser = session.user;
			}
		} catch (e) {
			console.error('Session load error:', e);
		}
	}

	// For public paths: return user if available, otherwise null
	if (isPublic) {
		return { user: sessionUser };
	}

	// For protected routes: if no valid session, redirect to login with return target
	if (!sessionUser) {
		const redirectTarget = url.pathname !== '/' && url.pathname !== '/login'
			? `?redirect=${encodeURIComponent(url.pathname + url.search)}`
			: '';
		throw redirect(302, `/login${redirectTarget}`);
	}

	return { user: sessionUser };
}

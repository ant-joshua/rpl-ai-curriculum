import { redirect } from '@sveltejs/kit';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

const PUBLIC_PATHS = new Set(['/', '/feed', '/feed.json', '/feed.xml', '/certificate', '/sitemap.xml', '/robots.txt', '/login', '/register', '/register/instructor', '/reset-password', '/catalog']);
const PUBLIC_PREFIXES = ['/certificate/', '/announcements'];

function isPublicPath(pathname: string): boolean {
	if (PUBLIC_PATHS.has(pathname)) return true;
	return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export async function load({ request, platform, url }: {
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (url.pathname.startsWith('/api/') || isPublicPath(url.pathname)) {
		return {};
	}

	const token = getTokenFromRequest(request);
	if (!token) {
		throw redirect(302, '/login');
	}
	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, '/login');
	}
	return { user: session.user };
}

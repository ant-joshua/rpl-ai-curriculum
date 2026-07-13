import { getSession, getBearerToken } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

// Allow admin roles — superadmin and admin have full access
const ADMIN_ROLES = ['superadmin', 'admin'];

export async function handle({ event, resolve }: {
	event: { request: Request; platform: App.Platform; locals: Record<string, any> };
	resolve: (event: any) => Promise<Response>;
}): Promise<Response> {
	const url = new URL(event.request.url);

	// Only intercept admin API routes
	if (url.pathname.startsWith('/api/admin/')) {
		const token = getBearerToken(event.request);

		if (!token) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized — Bearer token required' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const session = await getSession(event.platform, token);

		if (!session) {
			return new Response(JSON.stringify({ success: false, error: 'Unauthorized — invalid or expired token' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Also query the users table for role (migration 0021 added role column)
		const db = getDB(event.platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();

		if (!user) {
			return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Check admin role
		if (!ADMIN_ROLES.includes(user.role)) {
			return new Response(JSON.stringify({ success: false, error: 'Forbidden — admin role required' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Attach user info to locals for downstream use
		event.locals = event.locals || {};
		event.locals.user = user;
	}

	return resolve(event);
}

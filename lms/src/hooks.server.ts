import { getSession, getBearerToken } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { logActivity } from '$lib/server/analytics';

// Allow admin roles — superadmin and admin have full access
const ADMIN_ROLES = ['superadmin', 'admin'];

// Instructor-accessible API paths (instructors can also access these)
const INSTRUCTOR_API_PREFIX = '/api/instructor/';

export async function handle({ event, resolve }: {
	event: { request: Request; platform: App.Platform; locals: Record<string, any> };
	resolve: (event: any) => Promise<Response>;
}): Promise<Response> {
	const url = new URL(event.request.url);
	const path = url.pathname;

	// Try to get logged-in user for activity logging (available for any route)
	let currentUser: any = null;
	if (!path.startsWith('/api/admin/')) {
		const token = getBearerToken(event.request);
		if (token) {
			try {
				const session = await getSession(event.platform, token);
				if (session) {
					const db = getDB(event.platform);
					currentUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
				}
			} catch {
				// best-effort
			}
		}
	}

	// Admin API auth check
	if (path.startsWith('/api/admin/')) {
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
		currentUser = user;
	}

	// Instructor API auth check — instructors access their own course data
	if (path.startsWith(INSTRUCTOR_API_PREFIX)) {
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
		const db = getDB(event.platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
			return new Response(JSON.stringify({ success: false, error: 'Forbidden — instructor role required' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}
		event.locals = event.locals || {};
		event.locals.user = user;
		currentUser = user;
	}

	// Activity logging for specific actions (best-effort, fires after response)
	const method = event.request.method;
	const response = await resolve(event);

	if (currentUser && response.status < 400) {
		// Fire-and-forget activity logging
		logActivityAsync(event.platform, currentUser, method, path);
	}

	return response;
}

/**
 * Fire-and-forget activity logging for common LMS actions.
 * Runs after response is sent — never blocks the main request.
 */
async function logActivityAsync(platform: App.Platform, user: any, method: string, path: string) {
	try {
		let action: string | null = null;
		let entityType: string | null = null;
		let entityId: string | null = null;

		if (method === 'GET' && path.match(/^\/api\/lessons\/([^/]+)$/)) {
			action = 'view_lesson';
			entityType = 'lesson';
			entityId = path.match(/^\/api\/lessons\/([^/]+)$/)![1];
		} else if (path.match(/^\/api\/progress\/([^/]+)\/complete/) && method === 'POST') {
			action = 'complete_lesson';
			entityType = 'lesson';
			entityId = path.match(/^\/api\/progress\/([^/]+)\/complete/)![1];
		} else if (path.match(/^\/api\/discussions/) && method === 'POST') {
			action = 'create_thread';
			entityType = 'discussion';
		} else if (path.match(/^\/api\/replies/) && method === 'POST') {
			action = 'create_reply';
			entityType = 'reply';
		} else if (path.match(/^\/api\/assessments\/[^/]+\/submit/) && method === 'POST') {
			action = 'submit_assessment';
			entityType = 'assessment';
		}

		if (action) {
			await logActivity(platform, user.id, action, entityType, entityId);
		}
	} catch {
		// analytics logging is best-effort
	}
}

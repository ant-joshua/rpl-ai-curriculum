import { getSession, getBearerToken } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { logActivity } from '$lib/server/analytics';

// Allow admin roles — superadmin and admin have full access
const ADMIN_ROLES = ['superadmin', 'admin'];

// Instructor-accessible API paths (instructors can also access these)
const INSTRUCTOR_API_PREFIX = '/api/instructor/';
const GURU_API_PREFIX = '/api/guru/';
const TUTOR_API_PREFIX = '/api/tutor/';
const BIMBEL_API_PREFIX = '/api/bimbel/';
const DOSEN_API_PREFIX = '/api/dosen/';
const MAHASISWA_API_PREFIX = '/api/mahasiswa/';
const KAPRODI_API_PREFIX = '/api/kaprodi/';

export async function handle({ event, resolve }: {
	event: { request: Request; platform: App.Platform; locals: Record<string, any> };
	resolve: (event: any) => Promise<Response>;
}): Promise<Response> {
	const url = new URL(event.request.url);
	let path = url.pathname;

	// Tenant resolution: /t/[slug]/... → resolve tenant, REWRITE URL path
	const tenantMatch = path.match(/^\/t\/([^\/]+)(\/.*)?$/);
	if (tenantMatch) {
		const slug = tenantMatch[1];
		try {
			const db = getDB(event.platform);
			const tenant = await db.prepare('SELECT * FROM tenants WHERE slug = ? AND is_active = 1').bind(slug).first<any>();
			if (!tenant) {
				return new Response(JSON.stringify({ success: false, error: 'Tenant not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}
			event.locals = event.locals || {};
			event.locals.tenant = tenant;

			// Rewrite URL: /t/[slug]/path → /path via client-friendly redirect with tenant cookie
			const rewrittenUrl = event.request.url.replace(/\/t\/[^\/]+(\/|$)/, '/');
			// Redirect to clean URL with tenant cookie for subsequent requests
			// Hooks will read cookie to set locals.tenant on clean URLs
			return new Response(null, {
				status: 302,
				headers: {
					'Location': rewrittenUrl,
					'Set-Cookie': `tenant=${tenant.id}; Path=/; Max-Age=86400; SameSite=Lax`,
				},
			});
		} catch (e) {
			return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	} else {
		// No /t/ prefix — try cookie first, then fallback to default tenant
		try {
			const cookieHeader = event.request.headers.get('cookie') || '';
			const tenantCookie = cookieHeader.split(';').find(c => c.trim().startsWith('tenant='));
			if (tenantCookie) {
				const tenantId = tenantCookie.split('=')[1]?.trim();
				if (tenantId) {
					const db = getDB(event.platform);
					const tenant = await db.prepare('SELECT * FROM tenants WHERE id = ? AND is_active = 1').bind(tenantId).first<any>();
					if (tenant) {
						event.locals = event.locals || {};
						event.locals.tenant = tenant;
					}
				}
			} else {
				// Default tenant fallback
				const db = getDB(event.platform);
				const defaultTenant = await db.prepare('SELECT * FROM tenants WHERE slug = ? AND is_active = 1').bind('default').first<any>();
				if (defaultTenant) {
					event.locals = event.locals || {};
					event.locals.tenant = defaultTenant;
					// Set cookie if not already set (browser handles silently)
				}
			}
		} catch {
			// best-effort
		}
	}

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
	if (path.startsWith(INSTRUCTOR_API_PREFIX) || path.startsWith(GURU_API_PREFIX) || path.startsWith(TUTOR_API_PREFIX) || path.startsWith(BIMBEL_API_PREFIX) || path.startsWith(DOSEN_API_PREFIX) || path.startsWith(MAHASISWA_API_PREFIX) || path.startsWith(KAPRODI_API_PREFIX)) {
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

	// Activity logging — capture full HTTP metadata
	const method = event.request.method;
	const startTime = Date.now();
	const response = await resolve(event);
	const durationMs = Date.now() - startTime;

	if (currentUser) {
		// Fire-and-forget rich activity logging
		logActivityAsync(event.platform, currentUser, method, path, response.status, durationMs, event.request);
	}

	return response;
}

/**
 * Fire-and-forget activity logging with full HTTP metadata.
 * Runs after response is sent — never blocks the main request.
 */
async function logActivityAsync(
	platform: App.Platform,
	user: any,
	method: string,
	path: string,
	statusCode: number,
	durationMs: number,
	request: Request,
) {
	try {
		// Determine action type from method + path
		let action: string | null = null;
		let entityType: string | null = null;
		let entityId: string | null = null;

		// Try to classify the request by method + path pattern
		if (statusCode >= 400) {
			action = 'error';
		} else if (method === 'GET' && path.includes('/api/')) {
			action = 'read';
		} else if (method === 'POST' && path.includes('/api/')) {
			action = 'create';
		} else if (method === 'PUT' || method === 'PATCH' && path.includes('/api/')) {
			action = 'update';
		} else if (method === 'DELETE' && path.includes('/api/')) {
			action = 'delete';
		} else if (method === 'POST' && path === '/api/auth/login') {
			action = 'login';
		} else if (method === 'POST' && path === '/api/auth/logout') {
			action = 'logout';
		} else {
			action = method;
		}

		await logActivity(platform, user.id, action, entityType, entityId, undefined, {
			path,
			method,
			statusCode,
			durationMs,
			ipAddress: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || undefined,
			userAgent: request.headers.get('user-agent') || undefined,
		});
	} catch {
		// analytics logging is best-effort
	}
}

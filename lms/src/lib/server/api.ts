import { jsonResponse, getDB } from './d1';
import { getBearerToken, getSession } from './auth';

export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	meta?: Record<string, unknown>;
	details?: unknown;
};

/**
 * Standard successful API response.
 */
export function apiOk<T>(data: T, meta?: Record<string, unknown>, status = 200): Response {
	return jsonResponse({ success: true, data, ...(meta ? { meta } : {}) }, status);
}

/**
 * Standard error API response.
 */
export function apiError(error: string, status = 400, details?: unknown): Response {
	return jsonResponse({ success: false, error, ...(details ? { details } : {}) }, status);
}

/**
 * Helper to ensure a request is authenticated via locals.
 * Returns either { user } or { response } containing 401 error.
 */
export function requireAuth(locals: App.Locals): { user: any; response?: undefined } | { user?: undefined; response: Response } {
	if (!locals?.user) {
		return { response: apiError('Unauthorized — login required', 401) };
	}
	return { user: locals.user };
}

/**
 * Helper to ensure user has one of the allowed roles.
 * Returns either { user } or { response } containing 401/403 error.
 */
export function requireRole(
	locals: App.Locals,
	allowedRoles: string[]
): { user: any; response?: undefined } | { user?: undefined; response: Response } {
	const authCheck = requireAuth(locals);
	if (authCheck.response) return authCheck;

	if (!allowedRoles.includes(authCheck.user.role)) {
		return { response: apiError('Forbidden — insufficient permissions', 403) };
	}
	return { user: authCheck.user };
}

/**
 * Safe JSON parser for incoming requests.
 */
export async function parseJson<T>(request: Request): Promise<{ data: T; response?: undefined } | { data?: undefined; response: Response }> {
	try {
		const data = await request.json();
		return { data: data as T };
	} catch {
		return { response: apiError('Invalid JSON payload in request body', 400) };
	}
}

/**
 * Fast multi-tier auth resolver:
 * 1. Checks event.locals.user (0 DB latency, populated by hooks)
 * 2. Fallbacks to token + D1 session query if locals is missing (e.g. custom calls/tests)
 */
export async function authenticateRequest(
	locals?: App.Locals,
	request?: Request,
	platform?: App.Platform
): Promise<{ user: any; response?: undefined } | { user?: undefined; response: Response }> {
	if (locals?.user) {
		return { user: locals.user };
	}

	if (!request || !platform) {
		return { response: apiError('Unauthorized — login required', 401) };
	}

	const token = getBearerToken(request);
	if (!token) {
		return { response: apiError('Unauthorized — login required', 401) };
	}

	const session = await getSession(platform, token);
	if (!session) {
		return { response: apiError('Unauthorized — invalid or expired token', 401) };
	}

	const db = getDB(platform);
	const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
	if (!user) {
		return { response: apiError('User not found', 403) };
	}

	return { user };
}

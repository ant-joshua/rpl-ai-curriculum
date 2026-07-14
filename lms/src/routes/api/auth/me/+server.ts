import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user from the session token.
 * Accepts Authorization: Bearer <token> header.
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return json({ success: false, error: 'Not authenticated' }, 401);
		}

		const result = await getSession(platform, token);
		if (!result) {
			return json({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const { user } = result;

		// Get role from users table
		const db = getDB(platform);
		const userRow = await db
			.prepare('SELECT role FROM users WHERE id = ?')
			.bind(user.id)
			.first<{ role: string }>();

		return json({
			success: true,
			data: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				provider: user.provider,
				role: userRow?.role || 'student',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

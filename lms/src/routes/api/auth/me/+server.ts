import { authenticateRequest, apiOk, apiError } from '$lib/server/api';
import { getDB } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user with role and metadata.
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const user = auth.user;
		let role = user.role || 'student';

		// If user.role isn't already fetched, query users table
		if (!user.role && platform) {
			const db = getDB(platform);
			const userRow = await db
				.prepare('SELECT role FROM users WHERE id = ?')
				.bind(user.id)
				.first<{ role: string }>();
			if (userRow?.role) role = userRow.role;
		}

		return apiOk({
			id: user.id,
			name: user.display_name || user.name || user.username || 'User',
			username: user.username || user.display_name || 'user',
			email: user.email,
			avatar: user.avatar_url || user.avatar || null,
			provider: user.provider || 'local',
			role,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

import { getBearerToken, deleteSession } from '$lib/server/auth';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/**
 * POST /api/auth/logout
 *
 * Accepts Authorization: Bearer <token> header.
 * Deletes the session from D1.
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return json({ success: false, error: 'No session token provided' }, 401);
		}

		await deleteSession(platform, token);

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

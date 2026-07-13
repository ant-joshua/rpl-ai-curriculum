import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'PUT, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the current user.
 */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return json({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return json({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		await db
			.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
			.bind(session.user.id)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

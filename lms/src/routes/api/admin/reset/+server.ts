import { getDB } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		// Simple guard: check x-admin-key header
		const adminKey = request.headers.get('x-admin-key');
		const envKey = String((platform.env as Record<string, unknown>)['ADMIN_KEY'] || 'admin');

		if (adminKey !== envKey) {
			return json({ success: false, error: 'Unauthorized' }, 401);
		}

		const body: { user_id?: string } = await request.json();
		const userId = body.user_id;

		if (!userId) {
			return json({ success: false, error: 'user_id required' }, 400);
		}

		const db = getDB(platform);

		// Delete progress for user
		await db.prepare('DELETE FROM progress WHERE user_id = ?').bind(userId).run();

		// Delete XP for user
		await db.prepare('DELETE FROM user_xp WHERE user_id = ?').bind(userId).run();

		// Delete badges for user
		try {
			await db.prepare('DELETE FROM badges WHERE user_id = ?').bind(userId).run();
		} catch {
			// badges table may not exist
		}

		return json({ success: true, data: { message: `Progress reset for user ${userId}` } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

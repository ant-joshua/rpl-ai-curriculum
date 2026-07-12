import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { username?: string; device_id?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);

		if (!body.username?.trim()) {
			return json({ success: false, error: 'username required' }, 400);
		}

		const username = body.username.trim();

		// Upsert user
		const existing = await db
			.prepare('SELECT id, username, created_at FROM users WHERE id = ?')
			.bind(deviceId)
			.first<{ id: string; username: string; created_at: string }>();

		if (existing) {
			if (existing.username !== username) {
				await db
					.prepare('UPDATE users SET username = ? WHERE id = ?')
					.bind(username, deviceId)
					.run();
			}
			return json({
				success: true,
				user: { id: existing.id, username },
			});
		}

		// Create new user
		const now = new Date().toISOString();
		await db
			.prepare('INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)')
			.bind(deviceId, username, now)
			.run();

		return json({
			success: true,
			user: { id: deviceId, username },
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

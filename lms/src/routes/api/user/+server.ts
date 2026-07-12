import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
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

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		const user = await db
			.prepare('SELECT * FROM users WHERE id = ?')
			.bind(deviceId)
			.first<{ id: string; username: string; created_at: string }>();

		if (!user) {
			return json({ success: true, data: null });
		}

		return json({ success: true, data: user });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; username?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);

		// Check if user exists
		const existing = await db
			.prepare('SELECT * FROM users WHERE id = ?')
			.bind(deviceId)
			.first<{ id: string; username: string; created_at: string }>();

		if (existing) {
			// Update username if provided
			if (body.username && body.username !== existing.username) {
				await db
					.prepare('UPDATE users SET username = ? WHERE id = ?')
					.bind(body.username, deviceId)
					.run();
				existing.username = body.username;
			}
			return json({ success: true, data: existing });
		}

		// Create new user
		const now = new Date().toISOString();
		const username = body.username || `user-${deviceId.slice(0, 8)}`;

		await db
			.prepare('INSERT INTO users (id, username, created_at) VALUES (?, ?, ?)')
			.bind(deviceId, username, now)
			.run();

		return json({ success: true, data: { id: deviceId, username, created_at: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

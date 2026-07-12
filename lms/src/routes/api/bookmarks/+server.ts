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

		const { results } = await db
			.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC')
			.bind(deviceId)
			.all<{ id: string; user_id: string; module_slug: string; session_id: string; created_at: string }>();

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; module_slug?: string; session_id?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { module_slug } = body;
		const sessionId = body.session_id || '';

		if (!module_slug) {
			return json({ success: false, error: 'module_slug required' }, 400);
		}

		// Check if bookmark exists
		const existing = await db
			.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND module_slug = ? AND session_id = ?')
			.bind(deviceId, module_slug, sessionId)
			.first<{ id: string }>();

		if (existing) {
			// Toggle off — delete
			await db
				.prepare('DELETE FROM bookmarks WHERE id = ?')
				.bind(existing.id)
				.run();
			return json({ success: true, data: { bookmarked: false } });
		} else {
			// Toggle on — insert
			const id = `bm-${deviceId}-${module_slug}-${sessionId || 'nosession'}-${Date.now()}`;
			const now = new Date().toISOString();
			await db
				.prepare('INSERT INTO bookmarks (id, user_id, module_slug, session_id, created_at) VALUES (?, ?, ?, ?, ?)')
				.bind(id, deviceId, module_slug, sessionId, now)
				.run();
			return json({ success: true, data: { bookmarked: true } });
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

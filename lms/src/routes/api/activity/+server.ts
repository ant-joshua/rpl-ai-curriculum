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
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

		const { results } = await db
			.prepare('SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?')
			.bind(deviceId, limit)
			.all<{ id: string; user_id: string; action: string; module_slug: string | null; session_id: string | null; created_at: string }>();

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; action?: string; module_slug?: string; session_id?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { action, module_slug, session_id } = body;

		if (!action) {
			return json({ success: false, error: 'action required' }, 400);
		}

		const id = `act-${deviceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO activity_log (id, user_id, action, module_slug, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, deviceId, action, module_slug || null, session_id || null, now)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

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
		const moduleSlug = url.searchParams.get('module_slug');
		const sessionId = url.searchParams.get('session_id');

		if (moduleSlug && sessionId) {
			const note = await db
				.prepare('SELECT * FROM notes WHERE user_id = ? AND module_slug = ? AND session_id = ?')
				.bind(deviceId, moduleSlug, sessionId)
				.first<{ id: string; user_id: string; module_slug: string; session_id: string; content: string; created_at: string; updated_at: string }>();
			return json({ success: true, data: note || null });
		}

		const { results } = await db
			.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
			.bind(deviceId)
			.all();

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; module_slug?: string; session_id?: string; content?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { module_slug, session_id, content = '' } = body;

		if (!module_slug || !session_id) {
			return json({ success: false, error: 'module_slug and session_id required' }, 400);
		}

		const id = `note-${deviceId}-${module_slug}-${session_id}`;
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO notes (id, user_id, module_slug, session_id, content, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(user_id, module_slug, session_id)
				 DO UPDATE SET content = ?, updated_at = ?`
			)
			.bind(id, deviceId, module_slug, session_id, content, now, now, content, now)
			.run();

		return json({ success: true, data: { id, content } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

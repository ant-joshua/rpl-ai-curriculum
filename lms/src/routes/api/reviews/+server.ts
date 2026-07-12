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
		const deviceId = getDeviceId(request);
		const url = new URL(request.url);
		const filter = url.searchParams.get('filter');

		let data: any[] = [];

		if (filter === 'mine') {
			const { results } = await db
				.prepare(`
					SELECT rr.*, (SELECT COUNT(*) FROM reviews WHERE request_id = rr.id) as review_count
					FROM review_requests rr
					WHERE rr.user_id = ?
					ORDER BY rr.created_at DESC
				`)
				.bind(deviceId)
				.all<any>();
			data = results || [];
		} else {
			const { results } = await db
				.prepare(`
					SELECT rr.*, u.username as author_name,
						(SELECT COUNT(*) FROM reviews WHERE request_id = rr.id) as review_count
					FROM review_requests rr
					LEFT JOIN users u ON u.id = rr.user_id
					WHERE rr.status = 'open' AND rr.user_id != ?
					ORDER BY rr.created_at DESC
				`)
				.bind(deviceId)
				.all<any>();
			data = results || [];
		}

		return json({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body: { exercise_slug?: string; code?: string } = await request.json();

		if (!body.exercise_slug || !body.code) {
			return json({ success: false, error: 'exercise_slug and code required' }, 400);
		}

		const id = `rr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO review_requests (id, user_id, exercise_slug, code, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, deviceId, body.exercise_slug, body.code, 'open', now)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

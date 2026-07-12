import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { id } = params;

		const req = await db
			.prepare(`
				SELECT mr.*, su.username as student_name, mu.username as mentor_name
				FROM mentorship_requests mr
				LEFT JOIN users su ON su.id = mr.student_id
				LEFT JOIN users mu ON mu.id = mr.mentor_id
				WHERE mr.id = ?
			`)
			.bind(id)
			.first<any>();

		if (!req) {
			return json({ success: false, error: 'Not found' }, 404);
		}

		return json({ success: true, data: req });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body: { status?: string } = await request.json();
		const { id } = params;

		if (!body.status || !['accepted', 'rejected'].includes(body.status)) {
			return json({ success: false, error: 'status must be accepted or rejected' }, 400);
		}

		const now = new Date().toISOString();

		await db
			.prepare('UPDATE mentorship_requests SET mentor_id = ?, status = ?, responded_at = ? WHERE id = ? AND status = ?')
			.bind(deviceId, body.status, now, id, 'pending')
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

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
		const role = url.searchParams.get('role'); // 'student' or 'mentor'

		let results: any[] = [];

		if (role === 'mentor') {
			// Show pending requests where this user is mentor
			const { results: rows } = await db
				.prepare(`
					SELECT mr.*, u.username as student_name
					FROM mentorship_requests mr
					LEFT JOIN users u ON u.id = mr.student_id
					WHERE mr.mentor_id = ? AND mr.status = 'pending'
					ORDER BY mr.created_at DESC
				`)
				.bind(deviceId)
				.all<any>();
			results = rows || [];
		} else {
			// Default: show user's own requests (as student)
			const { results: rows } = await db
				.prepare(`
					SELECT mr.*, u.username as mentor_name
					FROM mentorship_requests mr
					LEFT JOIN users u ON u.id = mr.mentor_id
					WHERE mr.student_id = ?
					ORDER BY mr.created_at DESC
				`)
				.bind(deviceId)
				.all<any>();
			results = rows || [];
		}

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body: { path_slug?: string; message?: string } = await request.json();

		if (!body.path_slug) {
			return json({ success: false, error: 'path_slug required' }, 400);
		}

		const id = `ment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO mentorship_requests (id, student_id, path_slug, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, deviceId, body.path_slug, body.message || null, 'pending', now)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

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

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { id } = params;

		const request = await db
			.prepare(`
				SELECT rr.*, u.username as author_name
				FROM review_requests rr
				LEFT JOIN users u ON u.id = rr.user_id
				WHERE rr.id = ?
			`)
			.bind(id)
			.first<any>();

		if (!request) {
			return json({ success: false, error: 'Not found' }, 404);
		}

		const reviews = await db
			.prepare(`
				SELECT r.*, u.username as reviewer_name
				FROM reviews r
				LEFT JOIN users u ON u.id = r.reviewer_id
				WHERE r.request_id = ?
				ORDER BY r.created_at DESC
			`)
			.bind(id)
			.all<any>();

		return json({
			success: true,
			data: {
				...request,
				reviews: reviews?.results || [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const { id } = params;
		const body: { feedback?: string; score?: number } = await request.json();

		if (!body.feedback) {
			return json({ success: false, error: 'feedback required' }, 400);
		}

		const reviewId = `rev-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO reviews (id, request_id, reviewer_id, feedback, score, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(reviewId, id, deviceId, body.feedback, body.score ?? null, now)
			.run();

		// Mark request as closed after first review
		await db
			.prepare('UPDATE review_requests SET status = ? WHERE id = ? AND status = ?')
			.bind('closed', id, 'open')
			.run();

		return json({ success: true, data: { id: reviewId } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

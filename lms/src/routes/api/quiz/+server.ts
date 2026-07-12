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
		const moduleSlug = url.searchParams.get('module_slug');
		const sessionId = url.searchParams.get('session_id');

		let query = 'SELECT * FROM quiz_answers WHERE user_id = ?';
		const params: any[] = [deviceId];

		if (moduleSlug) {
			query += ' AND module_slug = ?';
			params.push(moduleSlug);
		}
		if (sessionId) {
			query += ' AND session_id = ?';
			params.push(sessionId);
		}
		query += ' ORDER BY answered_at DESC';

		const { results } = await db.prepare(query).bind(...params).all<any>();
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body = await request.json() as {
			module_slug: string;
			session_id: string;
			question: string;
			user_answer: string;
			correct_answer: string;
			correct: number;
		};

		if (!body.module_slug || !body.session_id || !body.question) {
			return json({ success: false, error: 'module_slug, session_id, and question required' }, 400);
		}

		const id = `qa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

		await db
			.prepare(
				'INSERT INTO quiz_answers (id, user_id, module_slug, session_id, question, user_answer, correct_answer, correct, answered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, deviceId, body.module_slug, body.session_id, body.question, body.user_answer, body.correct_answer, body.correct, now)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ params, request, platform }: {
	params: { id: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);

		const threads = await db
			.prepare(
				`SELECT t.*, u.display_name, u.avatar_url,
				 (SELECT COUNT(*) FROM discussion_replies r WHERE r.thread_id = t.id) as reply_count
				 FROM discussion_threads t
				 LEFT JOIN users u ON u.id = t.user_id
				 WHERE t.lesson_id = ?
				 ORDER BY t.is_pinned DESC, t.created_at DESC`
			)
			.bind(params.id)
			.all();

		return jsonResponse({
			success: true,
			data: threads.results || []
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: {
	params: { id: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const body = await request.json() as { title?: string; body?: string };
		if (!body.title || !body.body) {
			return jsonResponse({ success: false, error: 'Title and body are required' }, 400);
		}

		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				'INSERT INTO discussion_threads (id, lesson_id, user_id, title, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, params.id, session.session.user_id, body.title, body.body, now, now)
			.run();

		const thread = await db
			.prepare(
				`SELECT t.*, u.display_name, u.avatar_url,
				 (SELECT COUNT(*) FROM discussion_replies r WHERE r.thread_id = t.id) as reply_count
				 FROM discussion_threads t
				 LEFT JOIN users u ON u.id = t.user_id
				 WHERE t.id = ?`
			)
			.bind(id)
			.first<any>();

		return jsonResponse({ success: true, data: thread }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { chatGuru } from '$lib/server/aiedu';

// GET /api/aiedu/chat — list threads
// POST /api/aiedu/chat — create thread { title?, subject?, grade?, curriculum_id? }
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT t.id, t.title, t.subject, t.grade, t.curriculum_id,
			        c.name AS curriculum_name,
			        (SELECT COUNT(*) FROM aiedu_chat_messages m WHERE m.thread_id = t.id) AS message_count,
			        t.updated_at
			 FROM aiedu_chat_threads t
			 LEFT JOIN curricula c ON c.id = t.curriculum_id
			 WHERE t.user_id = ?
			 ORDER BY t.updated_at DESC`
		).bind(session.user.id).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { title, subject, grade, curriculum_id } = body;

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_chat_threads (id, user_id, title, subject, grade, curriculum_id)
			 VALUES (?, ?, ?, ?, ?, ?)`
		).bind(id, session.user.id, title?.trim() || 'Chat Baru', subject || '', grade || '', curriculum_id || null).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

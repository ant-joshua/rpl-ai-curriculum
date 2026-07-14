import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ params, request, platform }: {
	params: { id: string; threadId: string };
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

		const replies = await db
			.prepare(
				`SELECT r.*, u.display_name, u.avatar_url
				 FROM discussion_replies r
				 LEFT JOIN users u ON u.id = r.user_id
				 WHERE r.thread_id = ?
				 ORDER BY r.created_at ASC`
			)
			.bind(params.threadId)
			.all();

		return jsonResponse({
			success: true,
			data: replies.results || []
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: {
	params: { id: string; threadId: string };
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

		const body = await request.json() as { body?: string; parent_id?: string };
		if (!body.body) {
			return jsonResponse({ success: false, error: 'Body is required' }, 400);
		}

		const db = getDB(platform);

		// Check thread exists and is not locked
		const thread = await db
			.prepare('SELECT is_locked FROM discussion_threads WHERE id = ?')
			.bind(params.threadId)
			.first<any>();

		if (!thread) {
			return jsonResponse({ success: false, error: 'Thread not found' }, 404);
		}

		if (thread.is_locked) {
			return jsonResponse({ success: false, error: 'Thread is locked' }, 403);
		}

		// Detect instructor role
		const user = await db
			.prepare('SELECT role FROM users WHERE id = ?')
			.bind(session.session.user_id)
			.first<any>();
		const isInstructorReply = user ? ['superadmin', 'admin', 'instructor'].includes(user.role) : false;

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				'INSERT INTO discussion_replies (id, thread_id, user_id, body, parent_id, is_instructor_reply, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, params.threadId, session.session.user_id, body.body, body.parent_id || null, isInstructorReply ? 1 : 0, now, now)
			.run();

		// Update thread updated_at
		await db
			.prepare('UPDATE discussion_threads SET updated_at = ? WHERE id = ?')
			.bind(now, params.threadId)
			.run();

		const reply = await db
			.prepare(
				`SELECT r.*, u.display_name, u.avatar_url
				 FROM discussion_replies r
				 LEFT JOIN users u ON u.id = r.user_id
				 WHERE r.id = ?`
			)
			.bind(id)
			.first<any>();

		// Auto-notify thread owner (skip self-reply)
		const threadOwner = await db
			.prepare('SELECT user_id FROM discussion_threads WHERE id = ?')
			.bind(params.threadId)
			.first<{ user_id: string }>();
		if (threadOwner && threadOwner.user_id !== session.session.user_id) {
			const notifId = crypto.randomUUID();
			const lessonId = params.id;
			await db
				.prepare(
					'INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)'
				)
				.bind(
					notifId,
					threadOwner.user_id,
					'discussion_reply',
					'New reply to your thread',
					`${body.body?.slice(0, 100) ?? 'Someone replied'}`,
					`/learn/${lessonId}`
				)
				.run();
		}

		return jsonResponse({ success: true, data: reply }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

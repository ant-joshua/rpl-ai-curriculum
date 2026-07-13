import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ params, request, platform }: {
	params: { threadId: string };
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

		const thread = await db
			.prepare(
				`SELECT t.*, u.display_name, u.avatar_url,
				 (SELECT COUNT(*) FROM discussion_replies r WHERE r.thread_id = t.id) as reply_count
				 FROM discussion_threads t
				 LEFT JOIN users u ON u.id = t.user_id
				 WHERE t.id = ?`
			)
			.bind(params.threadId)
			.first<any>();

		if (!thread) {
			return jsonResponse({ success: false, error: 'Thread not found' }, 404);
		}

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
			data: {
				thread,
				replies: replies.results || []
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ params, request, platform }: {
	params: { threadId: string };
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

		const thread = await db
			.prepare('SELECT * FROM discussion_threads WHERE id = ?')
			.bind(params.threadId)
			.first<any>();

		if (!thread) {
			return jsonResponse({ success: false, error: 'Thread not found' }, 404);
		}

		// Only thread author or admin can edit
		if (thread.user_id !== session.session.user_id) {
			return jsonResponse({ success: false, error: 'Not authorized' }, 403);
		}

		const body = await request.json() as { title?: string; body?: string };
		const now = new Date().toISOString();

		if (body.title !== undefined && body.body !== undefined) {
			await db
				.prepare('UPDATE discussion_threads SET title = ?, body = ?, updated_at = ? WHERE id = ?')
				.bind(body.title, body.body, now, params.threadId)
				.run();
		} else if (body.title !== undefined) {
			await db
				.prepare('UPDATE discussion_threads SET title = ?, updated_at = ? WHERE id = ?')
				.bind(body.title, now, params.threadId)
				.run();
		} else if (body.body !== undefined) {
			await db
				.prepare('UPDATE discussion_threads SET body = ?, updated_at = ? WHERE id = ?')
				.bind(body.body, now, params.threadId)
				.run();
		}

		const updated = await db
			.prepare(
				`SELECT t.*, u.display_name, u.avatar_url,
				 (SELECT COUNT(*) FROM discussion_replies r WHERE r.thread_id = t.id) as reply_count
				 FROM discussion_threads t
				 LEFT JOIN users u ON u.id = t.user_id
				 WHERE t.id = ?`
			)
			.bind(params.threadId)
			.first<any>();

		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: {
	params: { threadId: string };
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

		const thread = await db
			.prepare('SELECT * FROM discussion_threads WHERE id = ?')
			.bind(params.threadId)
			.first<any>();

		if (!thread) {
			return jsonResponse({ success: false, error: 'Thread not found' }, 404);
		}

		// Only thread author or admin can delete
		if (thread.user_id !== session.session.user_id) {
			return jsonResponse({ success: false, error: 'Not authorized' }, 403);
		}

		// Soft delete: clear title and body, mark as locked
		const now = new Date().toISOString();
		await db
			.prepare('UPDATE discussion_threads SET title = ?, body = ?, is_locked = 1, updated_at = ? WHERE id = ?')
			.bind('[deleted]', '[deleted]', now, params.threadId)
			.run();

		return jsonResponse({ success: true, data: { id: params.threadId } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

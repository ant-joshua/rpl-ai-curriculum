import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * PATCH /api/threads/[threadId]
 * Instructor-only: resolve/unresolve, pin/unpin, update title/body
 */
export async function PATCH({ params, request, platform }: {
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

		// Get user with role
		const user = await db
			.prepare('SELECT * FROM users WHERE id = ?')
			.bind(session.session.user_id)
			.first<any>();

		if (!user) {
			return jsonResponse({ success: false, error: 'User not found' }, 404);
		}

		const isInstructor = ['superadmin', 'admin', 'instructor'].includes(user.role);

		// Get the thread
		const thread = await db
			.prepare('SELECT * FROM discussion_threads WHERE id = ?')
			.bind(params.threadId)
			.first<any>();

		if (!thread) {
			return jsonResponse({ success: false, error: 'Thread not found' }, 404);
		}

		const body = await request.json() as {
			is_resolved?: boolean;
			is_pinned?: boolean;
			is_locked?: boolean;
			title?: string;
			body_text?: string;
		};

		// Instructors can resolve/pin/lock
		// Thread author can edit title/body
		const canAdmin = isInstructor;
		const canEdit = thread.user_id === session.session.user_id || isInstructor;

		const updates: string[] = [];
		const values: any[] = [];

		if (body.is_resolved !== undefined && canAdmin) {
			updates.push('is_resolved = ?');
			values.push(body.is_resolved ? 1 : 0);
		}
		if (body.is_pinned !== undefined && canAdmin) {
			updates.push('is_pinned = ?');
			values.push(body.is_pinned ? 1 : 0);
		}
		if (body.is_locked !== undefined && canAdmin) {
			updates.push('is_locked = ?');
			values.push(body.is_locked ? 1 : 0);
		}
		if (body.title !== undefined && canEdit) {
			updates.push('title = ?');
			values.push(body.title);
		}
		if (body.body_text !== undefined && canEdit) {
			updates.push('body = ?');
			values.push(body.body_text);
		}

		if (updates.length === 0) {
			return jsonResponse({ success: false, error: 'No valid fields to update' }, 400);
		}

		if (!canAdmin && (body.is_resolved !== undefined || body.is_pinned !== undefined || body.is_locked !== undefined)) {
			return jsonResponse({ success: false, error: 'Only instructors can resolve, pin, or lock threads' }, 403);
		}

		if (!canEdit && body.title !== undefined && body.body_text !== undefined) {
			return jsonResponse({ success: false, error: 'Only thread author can edit' }, 403);
		}

		const now = new Date().toISOString();
		updates.push('updated_at = ?');
		values.push(now);
		values.push(params.threadId);

		await db
			.prepare(`UPDATE discussion_threads SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();

		// Return updated thread
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

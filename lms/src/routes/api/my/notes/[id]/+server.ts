import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * DELETE /api/my/notes/[id]
 * Delete a note by ID (owned by the authenticated user).
 */
export async function DELETE({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}
		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);
		const noteId = params.id;

		if (!noteId) {
			return jsonResponse({ success: false, error: 'Note ID is required' }, 400);
		}

		// Verify ownership
		const note = await db
			.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?')
			.bind(noteId, userId)
			.first<{ id: string }>();

		if (!note) {
			return jsonResponse({ success: false, error: 'Note not found or not owned by user' }, 404);
		}

		await db
			.prepare('DELETE FROM notes WHERE id = ?')
			.bind(noteId)
			.run();

		return jsonResponse({ success: true, data: { deleted: noteId } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

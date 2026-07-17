import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** DELETE /api/lessons/[lessonId]/discussions/[commentId] — delete own comment (or admin/instructor) */
export async function DELETE({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const { commentId } = params;
    const userId = session.user.id;
    const isAdmin = ['superadmin', 'admin', 'instructor'].includes(session.user.role);

    // Find comment
    const comment = await db.prepare('SELECT id, user_id FROM lesson_discussions WHERE id = ?').bind(commentId).first<any>();
    if (!comment) return jsonResponse({ success: false, error: 'Comment not found' }, 404);

    // Only owner or admin can delete
    if (comment.user_id !== userId && !isAdmin) {
      return jsonResponse({ success: false, error: 'Not authorized to delete this comment' }, 403);
    }

    // Delete replies first, then comment
    await db.prepare('DELETE FROM lesson_discussions WHERE parent_id = ?').bind(commentId).run();
    await db.prepare('DELETE FROM lesson_discussions WHERE id = ?').bind(commentId).run();

    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

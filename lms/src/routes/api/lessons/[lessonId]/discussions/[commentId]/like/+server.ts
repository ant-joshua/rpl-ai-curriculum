import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** POST /api/lessons/[lessonId]/discussions/[commentId]/like — like/unlike a comment (idempotent toggle) */
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const { lessonId, commentId } = params;

    const comment = await db.prepare('SELECT id FROM lesson_discussions WHERE id = ? AND lesson_id = ?').bind(commentId, lessonId).first<any>();
    if (!comment) return jsonResponse({ success: false, error: 'Comment not found' }, 404);

    const existing = await db.prepare('SELECT 1 FROM discussion_likes WHERE discussion_id = ? AND user_id = ?').bind(commentId, userId).first<any>();
    let liked = false;
    if (existing) {
      await db.prepare('DELETE FROM discussion_likes WHERE discussion_id = ? AND user_id = ?').bind(commentId, userId).run();
    } else {
      await db.prepare('INSERT INTO discussion_likes (discussion_id, user_id) VALUES (?, ?)').bind(commentId, userId).run();
      liked = true;
    }

    const count = await db.prepare('SELECT COUNT(*) as c FROM discussion_likes WHERE discussion_id = ?').bind(commentId).first<any>();
    return jsonResponse({ success: true, data: { liked, like_count: count?.c || 0 } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
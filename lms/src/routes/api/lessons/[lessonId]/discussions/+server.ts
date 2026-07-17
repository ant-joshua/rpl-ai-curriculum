import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/lessons/[lessonId]/discussions — get threaded comments for a lesson */
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const { lessonId } = params;

    // Get all discussions for this lesson, ordered by creation date
    const { results } = await db.prepare(
      `SELECT ld.*, u.display_name, u.avatar_url, u.role as user_role
       FROM lesson_discussions ld
       LEFT JOIN users u ON ld.user_id = u.id
       WHERE ld.lesson_id = ?
       ORDER BY ld.created_at ASC`
    ).bind(lessonId).all<any>();

    // Build threaded structure: top-level comments first, replies nested under parent_id
    const topLevel = (results || []).filter(r => !r.parent_id);
    const replies = (results || []).filter(r => r.parent_id);

    const threaded = topLevel.map(comment => ({
      ...comment,
      replies: replies.filter(r => r.parent_id === comment.id)
    }));

    return jsonResponse({ success: true, data: threaded });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/** POST /api/lessons/[lessonId]/discussions — post a comment */
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const { lessonId } = params;

    const body = await request.json();
    const { content, parent_id, course_offering_id } = body;

    if (!content || !content.trim()) {
      return jsonResponse({ success: false, error: 'Content is required' }, 400);
    }

    if (!course_offering_id) {
      return jsonResponse({ success: false, error: 'course_offering_id is required' }, 400);
    }

    // Verify lesson exists
    const lesson = await db.prepare('SELECT id FROM lessons WHERE id = ?').bind(lessonId).first<any>();
    if (!lesson) {
      return jsonResponse({ success: false, error: 'Lesson not found' }, 404);
    }

    // If parent_id provided, verify it exists
    if (parent_id) {
      const parent = await db.prepare('SELECT id FROM lesson_discussions WHERE id = ?').bind(parent_id).first<any>();
      if (!parent) {
        return jsonResponse({ success: false, error: 'Parent comment not found' }, 404);
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO lesson_discussions (id, lesson_id, course_offering_id, user_id, content, parent_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, lessonId, course_offering_id, userId, content.trim(), parent_id || null, now).run();

    const row = await db.prepare(
      `SELECT ld.*, u.display_name, u.avatar_url, u.role as user_role
       FROM lesson_discussions ld
       LEFT JOIN users u ON ld.user_id = u.id
       WHERE ld.id = ?`
    ).bind(id).first<any>();

    return jsonResponse({ success: true, data: row }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

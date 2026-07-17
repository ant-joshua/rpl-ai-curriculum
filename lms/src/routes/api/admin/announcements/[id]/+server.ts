import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/admin/announcements/[id] — get single announcement */
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);
    if (!['superadmin', 'admin', 'instructor'].includes(session.user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }

    const db = getDB(platform);
    const row = await db.prepare(
      `SELECT a.*, u.display_name as creator_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`
    ).bind(params.id).first<any>();

    if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
    return jsonResponse({ success: true, data: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/** PUT /api/admin/announcements/[id] — update announcement */
export async function PUT({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);
    if (!['superadmin', 'admin', 'instructor'].includes(session.user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }

    const db = getDB(platform);
    const body = await request.json();
    const { title, body: content, priority } = body;
    const now = new Date().toISOString();

    const updates: string[] = [];
    const paramsArr: (string | null)[] = [];

    if (title !== undefined) { updates.push('title = ?'); paramsArr.push(title); }
    if (content !== undefined) { updates.push('body = ?'); paramsArr.push(content); }
    if (priority !== undefined) { updates.push('priority = ?'); paramsArr.push(priority); }

    if (updates.length === 0) return jsonResponse({ success: false, error: 'No fields to update' }, 400);

    updates.push('updated_at = ?');
    paramsArr.push(now);
    paramsArr.push(params.id);

    await db.prepare(
      `UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...paramsArr).run();

    const row = await db.prepare(
      `SELECT a.*, u.display_name as creator_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`
    ).bind(params.id).first<any>();

    return jsonResponse({ success: true, data: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/** DELETE /api/admin/announcements/[id] — delete announcement */
export async function DELETE({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);
    if (!['superadmin', 'admin', 'instructor'].includes(session.user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }

    const db = getDB(platform);
    await db.prepare('DELETE FROM announcements WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

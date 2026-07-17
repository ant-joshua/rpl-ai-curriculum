import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/admin/announcements — list announcements (optionally filtered by offering) */
export async function GET({ request, platform, url }: { request: Request; platform: App.Platform; url: URL }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);
    const user = session.user;
    if (!['superadmin', 'admin', 'instructor'].includes(user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }

    const db = getDB(platform);
    const offeringId = url.searchParams.get('course_offering_id');

    let query = `SELECT a.*, u.display_name as creator_name
                 FROM announcements a
                 LEFT JOIN users u ON a.created_by = u.id`;
    const params: string[] = [];

    if (offeringId) {
      query += ` WHERE a.course_offering_id = ?`;
      params.push(offeringId);
    }
    query += ` ORDER BY a.created_at DESC`;

    const stmt = db.prepare(query);
    const result = await (params.length ? stmt.bind(...params) : stmt).all<any>();

    return jsonResponse({ success: true, data: result.results || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/** POST /api/admin/announcements — create announcement */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
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
    const { title, body: content, priority, course_offering_id } = body;

    if (!title || !content || !course_offering_id) {
      return jsonResponse({ success: false, error: 'title, body, and course_offering_id required' }, 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO announcements (id, course_offering_id, title, body, priority, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, course_offering_id, title, content, priority || 'normal', session.user.id, now, now).run();

    const row = await db.prepare(
      `SELECT a.*, u.display_name as creator_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`
    ).bind(id).first<any>();

    return jsonResponse({ success: true, data: row }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

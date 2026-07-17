import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);

    const { results } = await db.prepare(
      `SELECT cs.*, co.name AS offering_name, c.title AS course_title, c.icon AS course_icon
       FROM course_schedules cs
       JOIN course_offerings co ON co.id = cs.course_offering_id
       JOIN courses c ON c.id = co.course_id
       JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
       WHERE cs.start_time >= datetime('now', '-1 day')
       ORDER BY cs.start_time ASC
       LIMIT 50`
    ).bind(userId).all<any>();

    return jsonResponse({ success: true, data: results || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

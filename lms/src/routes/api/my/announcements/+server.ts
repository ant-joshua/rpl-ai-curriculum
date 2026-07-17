import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/my/announcements — list announcements for user's enrolled courses */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);

    // Get user's enrolled course offerings
    const { results: enrollments } = await db.prepare(
      `SELECT course_offering_id FROM enrollments WHERE user_id = ? AND (status = 'active' OR status = 'completed')`
    ).bind(userId).all<any>();

    const offeringIds = (enrollments || []).map(e => e.course_offering_id);
    if (offeringIds.length === 0) {
      // Also check if user is admin/instructor — see all
      if (['superadmin', 'admin', 'instructor'].includes(session.user.role)) {
        const result = await db.prepare(
          `SELECT a.*, u.display_name as creator_name,
                  co.name as offering_name, co.code as offering_code,
                  (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = ?) as is_read
           FROM announcements a
           LEFT JOIN users u ON a.created_by = u.id
           JOIN course_offerings co ON co.id = a.course_offering_id
           ORDER BY a.created_at DESC`
        ).bind(userId).all<any>();
        return jsonResponse({ success: true, data: result.results || [] });
      }
      return jsonResponse({ success: true, data: [] });
    }

    // Build placeholders for IN clause
    const placeholders = offeringIds.map(() => '?').join(',');
    const query = `SELECT a.*, u.display_name as creator_name,
                          co.name as offering_name, co.code as offering_code,
                          (SELECT COUNT(*) FROM announcement_reads ar WHERE ar.announcement_id = a.id AND ar.user_id = ?) as is_read
                   FROM announcements a
                   LEFT JOIN users u ON a.created_by = u.id
                   JOIN course_offerings co ON co.id = a.course_offering_id
                   WHERE a.course_offering_id IN (${placeholders})
                   ORDER BY a.created_at DESC`;

    const result = await db.prepare(query).bind(userId, ...offeringIds).all<any>();

    return jsonResponse({ success: true, data: result.results || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

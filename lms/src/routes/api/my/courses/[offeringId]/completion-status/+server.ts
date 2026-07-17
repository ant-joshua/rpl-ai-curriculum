import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** GET /api/my/courses/[offeringId]/completion-status — show progress details */
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const { offeringId } = params;

    // Total published lessons
    const totalResult = await db.prepare(
      "SELECT COUNT(*) as cnt FROM lessons WHERE course_offering_id = ? AND status = 'published'"
    ).bind(offeringId).first<{ cnt: number }>();
    const totalLessons = totalResult?.cnt ?? 0;

    // Completed lessons for user
    const completedResult = await db.prepare(
      `SELECT COUNT(DISTINCT p.session_id) as cnt
       FROM progress p
       JOIN lessons l ON l.slug = p.session_id AND l.course_offering_id = ?
       WHERE p.user_id = ? AND p.completed = 1`
    ).bind(offeringId, userId).first<{ cnt: number }>();
    const completedLessons = completedResult?.cnt ?? 0;

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const eligibleForCertificate = totalLessons > 0 && completedLessons >= totalLessons;

    // Check existing course completion
    const completion = await db.prepare(
      'SELECT id, completed_at, certificate_id FROM course_completions WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    // Check existing certificate
    const cert = await db.prepare(
      'SELECT id, certificate_number FROM certificates WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    return jsonResponse({
      success: true,
      data: {
        totalLessons,
        completedLessons,
        percentage,
        eligibleForCertificate,
        isCompleted: !!completion,
        completion,
        certificate: cert ? {
          id: cert.id,
          certificate_number: cert.certificate_number,
          url: `/certificate/${cert.id}`
        } : null
      }
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

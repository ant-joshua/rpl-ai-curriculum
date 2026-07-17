import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** POST /api/my/courses/[offeringId]/complete — mark course completed (checks all required lessons done) */
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const { offeringId } = params;

    // Check enrollment
    const enrollment = await db.prepare(
      'SELECT status FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    if (!enrollment) {
      return jsonResponse({ success: false, error: 'Not enrolled in this course' }, 403);
    }

    // Count total published lessons
    const totalLesson = await db.prepare(
      'SELECT COUNT(*) as cnt FROM lessons WHERE course_offering_id = ? AND status = ?'
    ).bind(offeringId, 'published').first<{ cnt: number }>();

    const totalLessons = totalLesson?.cnt ?? 0;
    if (totalLessons === 0) {
      return jsonResponse({ success: false, error: 'No published lessons' }, 400);
    }

    // Count completed lessons
    const completedResult = await db.prepare(
      `SELECT COUNT(DISTINCT p.session_id) as cnt
       FROM progress p
       JOIN lessons l ON l.slug = p.session_id AND l.course_offering_id = ?
       WHERE p.user_id = ? AND p.completed = 1`
    ).bind(offeringId, userId).first<{ cnt: number }>();

    const completedLessons = completedResult?.cnt ?? 0;

    if (completedLessons < totalLessons) {
      return jsonResponse({
        success: false,
        error: 'Belum menyelesaikan semua pelajaran',
        data: { completedLessons, totalLessons }
      }, 403);
    }

    // Check existing completion
    const existing = await db.prepare(
      'SELECT id, certificate_id FROM course_completions WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    if (existing) {
      return jsonResponse({
        success: true,
        data: { id: existing.id, alreadyCompleted: true, certificate_id: existing.certificate_id }
      });
    }

    // Auto-issue certificate if not exists
    const existingCert = await db.prepare(
      'SELECT id FROM certificates WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    let certId: string | null = existingCert?.id || null;

    if (!certId) {
      // Generate certificate
      certId = crypto.randomUUID();
      const now = new Date().toISOString();
      const year = now.slice(0, 4);

      // Get offering code for cert number
      const offering = await db.prepare('SELECT code FROM course_offerings WHERE id = ?').bind(offeringId).first<any>();
      const code = offering?.code || 'CRS';

      // Sequential number
      const existingCerts = await db.prepare(
        `SELECT certificate_number FROM certificates WHERE certificate_number LIKE ? ORDER BY certificate_number DESC`
      ).bind(`RPL/${year}/${code}-%`).all<any>();

      let seq = 1;
      if (existingCerts && existingCerts.results && existingCerts.results.length > 0) {
        const lastNum = existingCerts.results[0].certificate_number;
        const parts = lastNum.split('-');
        seq = parseInt(parts[parts.length - 1], 10) + 1;
      }

      const certNumber = `RPL/${year}/${code}-${String(seq).padStart(3, '0')}`;

      await db.prepare(
        'INSERT INTO certificates (id, user_id, course_offering_id, certificate_number, issued_at, metadata) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(certId, userId, offeringId, certNumber, now, '{}').run();
    }

    // Create course completion record
    const completionId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      'INSERT INTO course_completions (id, user_id, course_offering_id, completed_at, certificate_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(completionId, userId, offeringId, now, certId).run();

    return jsonResponse({
      success: true,
      data: {
        id: completionId,
        certificate_id: certId,
        certificate_url: `/certificate/${certId}`,
        completed_at: now,
        newlyCompleted: true
      }
    }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

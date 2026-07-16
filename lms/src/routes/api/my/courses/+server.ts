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

    // Enrolled courses with offering info
    const { results: enrollments } = await db.prepare(
      `SELECT e.id AS enrollment_id, e.course_offering_id, e.status AS enrollment_status, e.enrolled_at,
              co.id AS offering_id, co.name AS offering_name, co.code AS offering_code,
              co.start_date, co.end_date, co.status AS offering_status,
              c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
              c.icon AS course_icon, c.description AS course_description, c.category, c.level
       FROM enrollments e
       JOIN course_offerings co ON co.id = e.course_offering_id
       JOIN courses c ON c.id = co.course_id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC`
    ).bind(userId).all<any>();

    // Instructor info
    const offeringIds = (enrollments || []).map(e => e.course_offering_id);
    if (offeringIds.length === 0) {
      return jsonResponse({ success: true, data: [] });
    }

    const placeholders = offeringIds.map(() => '?').join(',');
    const { results: instructors } = await db.prepare(
      `SELECT co.id AS offering_id, u.id AS instructor_id, u.display_name AS instructor_name
       FROM course_offerings co
       JOIN users u ON u.id = co.instructor_id
       WHERE co.id IN (${placeholders})`
    ).bind(...offeringIds).all<any>();

    const instructorMap = new Map<string, any>();
    for (const inst of (instructors || [])) {
      instructorMap.set(inst.offering_id, { id: inst.instructor_id, name: inst.instructor_name });
    }

    // Progress data
    const { results: progressRows } = await db.prepare(
      `SELECT p.session_id, p.completed, l.course_offering_id
       FROM progress p
       JOIN lessons l ON l.slug = p.session_id
       WHERE p.user_id = ? AND p.completed = 1`
    ).bind(userId).all<any>();

    const completedByOffering = new Map<string, Set<string>>();
    for (const row of (progressRows || [])) {
      const offId = row.course_offering_id;
      if (!completedByOffering.has(offId)) completedByOffering.set(offId, new Set());
      completedByOffering.get(offId)!.add(row.session_id);
    }

    // Count total lessons per offering
    const { results: allLessons } = await db.prepare(
      `SELECT course_offering_id, COUNT(*) AS total
       FROM lessons WHERE status = 'published'
       GROUP BY course_offering_id`
    ).all<any>();

    const lessonCountMap = new Map<string, number>();
    for (const row of (allLessons || [])) {
      lessonCountMap.set(row.course_offering_id, row.total);
    }

    const courses = (enrollments || []).map(e => {
      const offId = e.course_offering_id;
      const completedSet = completedByOffering.get(offId) || new Set();
      const total = lessonCountMap.get(offId) || 0;
      const completed = completedSet.size;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const instructor = instructorMap.get(offId) || null;

      return {
        offeringId: e.offering_id,
        offeringName: e.offering_name,
        offeringCode: e.offering_code,
        offeringStatus: e.offering_status,
        enrollmentStatus: e.enrollment_status,
        enrolledAt: e.enrolled_at,
        startDate: e.start_date,
        endDate: e.end_date,
        course: {
          id: e.course_id,
          title: e.course_title,
          slug: e.course_slug,
          icon: e.course_icon || '📚',
          description: e.course_description,
          category: e.category,
          level: e.level,
        },
        instructor,
        progress: { completed, total, percentage: pct },
      };
    });

    return jsonResponse({ success: true, data: courses });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

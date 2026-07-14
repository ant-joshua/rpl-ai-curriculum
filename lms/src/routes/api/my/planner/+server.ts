import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/my/planner?offeringId=X
 * Returns study plan + per-week progress breakdown
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);
    const url = new URL(request.url);
    const offeringId = url.searchParams.get('offeringId');

    if (!offeringId) {
      return jsonResponse({ success: false, error: 'offeringId parameter required' }, 400);
    }

    // Fetch plan
    const plan = await db.prepare(
      'SELECT * FROM study_plans WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, offeringId).first<any>();

    // Fetch offering with course info
    const offering = await db.prepare(
      `SELECT co.id, co.name, co.start_date, co.end_date, c.title AS course_title, c.icon AS course_icon
       FROM course_offerings co
       JOIN courses c ON c.id = co.course_id
       WHERE co.id = ?`
    ).bind(offeringId).first<any>();
    if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

    // Fetch all published lessons for this offering
    const { results: lessons } = await db.prepare(
      'SELECT id, title, slug, order_index FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
    ).bind(offeringId, 'published').all<any>();
    const totalLessons = lessons?.length ?? 0;

    // Fetch completed progress for this offering
    const { results: progressRows } = await db.prepare(
      `SELECT p.session_id, p.completed_at
       FROM progress p
       JOIN lessons l ON l.slug = p.session_id
       WHERE p.user_id = ? AND l.course_offering_id = ? AND p.completed = 1`
    ).bind(userId, offeringId).all<any>();

    const completedLessons = progressRows?.length ?? 0;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Compute completed dates per lesson into week mapping
    const completedByWeek = new Map<string, number>();
    for (const row of (progressRows || [])) {
      if (!row.completed_at) continue;
      const d = new Date(row.completed_at);
      const wk = getWeekKey(d);
      completedByWeek.set(wk, (completedByWeek.get(wk) || 0) + 1);
    }

    // Per-week breakdown
    type WeekData = {
      weekLabel: string;
      weekStart: string;
      weekEnd: string;
      target: number;
      actual: number;
      status: 'ahead' | 'on_track' | 'behind' | 'future' | 'past';
      cumulativeTarget: number;
      cumulativeActual: number;
    };

    const weeks: WeekData[] = [];
    const now = new Date();

    if (plan && plan.start_week && offering.start_date && offering.end_date) {
      const startDate = new Date(offering.start_date);
      const endDate = new Date(offering.end_date);
      const planStart = new Date(plan.start_week);

      // Generate weeks from plan start to offering end
      let cursor = new Date(planStart);
      const targetPerWeek = plan.target_lessons_per_week || 3;
      let cumTarget = 0;
      let cumActual = 0;

      while (cursor <= endDate) {
        const wkKey = getWeekKey(cursor);
        const weekStart = new Date(cursor);
        const weekEnd = new Date(cursor);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

        const actual = completedByWeek.get(wkKey) || 0;
        cumTarget += targetPerWeek;
        cumActual += actual;

        let status: WeekData['status'];
        if (weekStart > now) {
          status = 'future';
        } else if (actual >= targetPerWeek) {
          status = 'on_track';
        } else if (cumActual >= cumTarget) {
          status = 'on_track';
        } else if (actual > 0) {
          status = 'behind';
        } else if (cumActual === 0 && cumTarget > 0) {
          status = 'behind';
        } else {
          status = 'past';
        }

        // Special: if week is complete and target met
        if (weekEnd < now && actual >= targetPerWeek) {
          status = 'on_track';
        }
        if (weekEnd < now && actual < targetPerWeek && actual === 0) {
          status = 'behind';
        }

        weeks.push({
          weekLabel,
          weekStart: weekStart.toISOString().slice(0, 10),
          weekEnd: weekEnd.toISOString().slice(0, 10),
          target: targetPerWeek,
          actual,
          status,
          cumulativeTarget: cumTarget,
          cumulativeActual: cumActual,
        });

        cursor.setDate(cursor.getDate() + 7);
      }
    }

    // Current week: find uncompleted lessons in order for recommendation
    const completedSlugs = new Set((progressRows || []).map(r => r.session_id));
    let nextLessonSlug: string | null = null;
    let nextLessonTitle: string | null = null;
    let remainingThisWeek = 0;

    if (plan && plan.target_lessons_per_week) {
      // How many completed this week?
      const thisWeekKey = getWeekKey(now);
      const doneThisWeek = completedByWeek.get(thisWeekKey) || 0;
      remainingThisWeek = Math.max(0, plan.target_lessons_per_week - doneThisWeek);
    }

    // Find first uncompleted lesson
    for (const lesson of (lessons || [])) {
      if (!completedSlugs.has(lesson.slug)) {
        nextLessonSlug = lesson.slug;
        nextLessonTitle = lesson.title;
        break;
      }
    }

    // Current status
    let overallStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
    if (weeks.length > 0) {
      const lastCompleteWeek = [...weeks].reverse().find(w => w.weekEnd < now.toISOString().slice(0, 10));
      if (lastCompleteWeek) {
        if (lastCompleteWeek.cumulativeActual >= lastCompleteWeek.cumulativeTarget) {
          overallStatus = 'on_track';
        } else {
          overallStatus = 'behind';
        }
      }
      const currentWeek = weeks.find(w => w.weekStart <= now.toISOString().slice(0, 10) && w.weekEnd >= now.toISOString().slice(0, 10));
      if (currentWeek && currentWeek.actual > currentWeek.target) {
        overallStatus = 'ahead';
      }
    }

    return jsonResponse({
      success: true,
      data: {
        plan: plan ? {
          id: plan.id,
          course_offering_id: plan.course_offering_id,
          target_lessons_per_week: plan.target_lessons_per_week,
          start_week: plan.start_week,
          daily_reminder: plan.daily_reminder === 1,
          reminder_time: plan.reminder_time,
          created_at: plan.created_at,
        } : null,
        offering: {
          id: offering.id,
          name: offering.name,
          course_title: offering.course_title,
          course_icon: offering.course_icon || '📚',
          start_date: offering.start_date,
          end_date: offering.end_date,
          total_lessons: totalLessons,
        },
        progress: {
          completed_lessons: completedLessons,
          total_lessons: totalLessons,
          percentage,
        },
        weeks,
        recommendations: {
          overall_status: overallStatus,
          next_lesson_slug: nextLessonSlug,
          next_lesson_title: nextLessonTitle,
          remaining_this_week: remainingThisWeek,
        },
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/**
 * POST /api/my/planner
 * Body: { course_offering_id, target_lessons_per_week, start_week }
 * Create or update study plan
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);
    const body: { course_offering_id?: string; target_lessons_per_week?: number; start_week?: string } = await request.json();

    if (!body.course_offering_id) {
      return jsonResponse({ success: false, error: 'course_offering_id required' }, 400);
    }

    // Verify enrollment
    const enrollment = await db.prepare(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
    ).bind(userId, body.course_offering_id).first<any>();
    if (!enrollment) {
      return jsonResponse({ success: false, error: 'Not enrolled in this offering' }, 403);
    }

    const now = new Date().toISOString();
    const id = `plan-${userId}-${body.course_offering_id}`;
    const targetPerWeek = body.target_lessons_per_week ?? 3;
    const startWeek = body.start_week || new Date().toISOString().slice(0, 10);

    await db.prepare(
      `INSERT INTO study_plans (id, user_id, course_offering_id, target_lessons_per_week, start_week, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, course_offering_id)
       DO UPDATE SET target_lessons_per_week = ?, start_week = ?, updated_at = ?`
    ).bind(
      id, userId, body.course_offering_id, targetPerWeek, startWeek, now, now,
      targetPerWeek, startWeek, now
    ).run();

    return jsonResponse({ success: true, data: { id } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

/** Get ISO week key like "2024-W01" from a date */
function getWeekKey(d: Date): string {
  const temp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

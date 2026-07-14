import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * POST /api/my/planner/reminder
 * Body: { course_offering_id, daily_reminder, reminder_time? }
 * Set notification preferences for a study plan
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const userId = session.user.id;
    const db = getDB(platform);
    const body: { course_offering_id?: string; daily_reminder?: boolean; reminder_time?: string } = await request.json();

    if (!body.course_offering_id) {
      return jsonResponse({ success: false, error: 'course_offering_id required' }, 400);
    }

    const now = new Date().toISOString();
    const id = `plan-${userId}-${body.course_offering_id}`;
    const dailyReminder = body.daily_reminder ? 1 : 0;
    const reminderTime = body.reminder_time || '09:00';

    // Upsert — create if doesn't exist with defaults
    await db.prepare(
      `INSERT INTO study_plans (id, user_id, course_offering_id, target_lessons_per_week, start_week, daily_reminder, reminder_time, created_at, updated_at)
       VALUES (?, ?, ?, 3, DATE('now'), ?, ?, ?, ?)
       ON CONFLICT(user_id, course_offering_id)
       DO UPDATE SET daily_reminder = ?, reminder_time = ?, updated_at = ?`
    ).bind(
      id, userId, body.course_offering_id, dailyReminder, reminderTime, now, now,
      dailyReminder, reminderTime, now
    ).run();

    return jsonResponse({ success: true, data: { daily_reminder: body.daily_reminder, reminder_time: reminderTime } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

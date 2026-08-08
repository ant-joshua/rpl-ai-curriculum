import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/my/calendar.ics — export schedules + assignment deadlines as iCal feed
 * Compatible with Google Calendar / Apple Calendar / Outlook.
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const now = new Date();

    // Fetch schedules (enrolled offerings)
    const { results: schedules } = await db.prepare(
      `SELECT cs.*, co.name AS offering_name
       FROM course_schedules cs
       JOIN course_offerings co ON co.id = cs.course_offering_id
       JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
       WHERE cs.start_time >= datetime('now', '-1 day')
       ORDER BY cs.start_time ASC`
    ).bind(userId).all<any>();

    // Fetch assignment deadlines
    const { results: assignments } = await db.prepare(
      `SELECT a.id, a.title, a.due_date, co.name AS offering_name
       FROM assignments a
       JOIN course_offerings co ON co.id = a.course_offering_id
       JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
       WHERE a.due_date IS NOT NULL
       ORDER BY a.due_date ASC`
    ).bind(userId).all<any>();

    const esc = (s: string): string =>
      s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    const fmtDate = (d: Date): string => {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RPL AI Learning//LMS//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:RPL AI Jadwal',
      'X-WR-TIMEZONE:Asia/Jakarta',
    ];

    for (const s of (schedules || [])) {
      const start = new Date(s.start_time.replace(' ', 'T') + 'Z');
      const end = new Date(s.end_time ? s.end_time.replace(' ', 'T') + 'Z' : start.getTime() + 60 * 60 * 1000);
      const uid = `schedule-${s.id}@rpl-ai-lms`;
      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${fmtDate(now)}`,
        `DTSTART:${fmtDate(start)}`,
        `DTEND:${fmtDate(end)}`,
        `SUMMARY:${esc(s.title || 'Kelas')} — ${esc(s.offering_name || '')}`,
        `DESCRIPTION:${esc(s.description || 'Jadwal kelas RPL AI')}`,
        'END:VEVENT'
      );
    }

    for (const a of (assignments || [])) {
      const due = new Date(a.due_date.replace(' ', 'T') + 'Z');
      const uid = `assignment-${a.id}@rpl-ai-lms`;
      ics.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${fmtDate(now)}`,
        `DTSTART:${fmtDate(due)}`,
        `DTEND:${fmtDate(new Date(due.getTime() + 60 * 60 * 1000))}`,
        `SUMMARY:⏰ Tugas: ${esc(a.title)}`,
        `DESCRIPTION:${esc(a.offering_name || '')} — deadline pengumpulan tugas`,
        `CATEGORIES:ASSIGNMENT`,
        'END:VEVENT'
      );
    }

    ics.push('END:VCALENDAR');

    const body = ics.join('\r\n') + '\r\n';
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rpl-ai-jadwal.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
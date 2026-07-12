import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, platform }) => {
  const DB = platform?.env?.DB as D1Database | undefined;
  const deviceId = url.searchParams.get('device_id');
  
  if (!DB || !deviceId) {
    // Return a sample .ics for demo
    const sampleIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RPL AI LMS//ID
BEGIN:VEVENT
UID:1@rpl-ai-lms
DTSTART:20260714T090000
DTEND:20260714T100000
RRULE:FREQ=DAILY;COUNT=30
SUMMARY:Belajar RPL AI - Session Harian
DESCRIPTION:Sesi belajar harian dari rencana studi RPL AI Curriculum
LOCATION:lms-syllabus.ant-joshua.my.id
END:VEVENT
END:VCALENDAR`;
    
    return new Response(sampleIcs, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="study-plan.ics"',
        'Cache-Control': 'no-cache'
      }
    });
  }

  try {
    // Try to get user's study plan for personalized calendar
    const plan = await DB.prepare(
      'SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(deviceId).first<{ path_slug: string; daily_target: number }>();

    const pathName = plan?.path_slug || 'RPL AI';
    
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RPL AI LMS//ID
BEGIN:VEVENT
UID:1@rpl-ai-lms
DTSTART:20260714T090000
DTEND:20260714T100000
RRULE:FREQ=DAILY;COUNT=30
SUMMARY:Belajar ${pathName}
DESCRIPTION:Sesi belajar harian ${plan ? `- target ${plan.daily_target} sesi/hari` : ''} dari RPL AI Curriculum
LOCATION:lms-syllabus.ant-joshua.my.id
END:VEVENT
END:VCALENDAR`;

    return new Response(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="study-plan.ics"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch {
    // Fallback
    return new Response('BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//RPL AI LMS//ID\nEND:VCALENDAR', {
      headers: { 'Content-Type': 'text/calendar' }
    });
  }
};

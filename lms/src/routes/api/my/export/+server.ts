import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/**
 * GET /api/my/export?format=csv|json&scope=grades|activity|all
 * Export user's learning data (grades, XP, activity) as CSV or JSON download.
 */
export async function GET({ request, platform, url }: { request: Request; platform: App.Platform; url: URL }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;
    const format = url.searchParams.get('format') || 'csv';
    const scope = url.searchParams.get('scope') || 'all';

    type Row = Record<string, string | number | null>;
    const tables: Record<string, { rows: Row[]; headers: string[] }> = {};

    const escapeCsv = (v: unknown): string => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const toCsv = (rows: Row[], headers: string[]): string =>
      headers.join(',') + '\n' + rows.map(r => headers.map(h => escapeCsv(r[h])).join(',')).join('\n');

    // Grades export
    if (scope === 'all' || scope === 'grades') {
      const { results: grades } = await db.prepare(
        `SELECT a.title as assessment_title, a.type as assessment_type,
                g.score, g.max_score, g.feedback, g.graded_at
         FROM gradebook g
         LEFT JOIN assessment_submissions asub ON asub.id = g.assessment_submission_id
         LEFT JOIN assessments a ON a.id = asub.assessment_id
         WHERE g.user_id = ?
         ORDER BY g.graded_at DESC`
      ).bind(userId).all<any>();
      tables.grades = {
        headers: ['assessment_title', 'assessment_type', 'score', 'max_score', 'pct', 'feedback', 'graded_at'],
        rows: (grades || []).map((g: any) => ({
          assessment_title: g.assessment_title,
          assessment_type: g.assessment_type,
          score: g.score,
          max_score: g.max_score,
          pct: g.max_score > 0 ? Math.round((g.score / g.max_score) * 100) : 0,
          feedback: g.feedback,
          graded_at: g.graded_at,
        })),
      };
    }

    // XP / gamification export
    if (scope === 'all' || scope === 'xp') {
      const { results: xp } = await db.prepare(
        `SELECT amount, reason, reference_type, created_at
         FROM xp_transactions
         WHERE user_id = ?
         ORDER BY created_at DESC`
      ).bind(userId).all<any>();
      tables.xp = {
        headers: ['amount', 'reason', 'reference_type', 'created_at'],
        rows: (xp || []).map((x: any) => ({
          amount: x.amount, reason: x.reason, reference_type: x.reference_type, created_at: x.created_at,
        })),
      };
    }

    // Enrollments / courses
    if (scope === 'all' || scope === 'courses') {
      const { results: courses } = await db.prepare(
        `SELECT co.name as course_name, e.status, e.enrolled_at, e.progress
         FROM enrollments e
         LEFT JOIN course_offerings co ON co.id = e.course_offering_id
         WHERE e.user_id = ?
         ORDER BY e.enrolled_at DESC`
      ).bind(userId).all<any>();
      tables.courses = {
        headers: ['course_name', 'status', 'enrolled_at', 'progress'],
        rows: (courses || []).map((c: any) => ({
          course_name: c.course_name, status: c.status, enrolled_at: c.enrolled_at, progress: c.progress,
        })),
      };
    }

    // Build output
    if (format === 'json') {
      return new Response(JSON.stringify({ success: true, data: tables }, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="lms-export-${scope}.json"`,
        },
      });
    }

    // CSV — combine all tables into one file with section headers
    let csvOutput = '';
    for (const [key, table] of Object.entries(tables)) {
      csvOutput += `\n# ${key.toUpperCase()}\n`;
      csvOutput += toCsv(table.rows, table.headers) + '\n';
    }

    return new Response(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lms-export-${scope}.csv"`,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
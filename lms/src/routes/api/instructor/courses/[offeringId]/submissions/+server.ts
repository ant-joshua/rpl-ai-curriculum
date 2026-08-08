import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/instructor/courses/[offeringId]/submissions — list all submissions for the offering */
export async function GET({ request, params, platform, locals }: {
  request: Request;
  params: { offeringId: string };
  platform: App.Platform;
  locals: Record<string, any>;
}): Promise<Response> {
  try {
    const db = getDB(platform);
    const user = locals.user;

    const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(params.offeringId).first() as any;
    if (!offering) return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
    if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }

    const url = new URL(request.url);
    const assignmentId = url.searchParams.get('assignment_id') || '';

    let sql = `SELECT asub.*, u.display_name AS user_name, u.avatar_url AS user_avatar,
                      a.title AS assignment_title
               FROM assignment_submissions asub
               LEFT JOIN users u ON u.id = asub.user_id
               LEFT JOIN assignments a ON a.id = asub.assignment_id
               WHERE asub.assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?)`;
    const paramsArr: unknown[] = [params.offeringId];
    if (assignmentId) {
      sql += ' AND asub.assignment_id = ?';
      paramsArr.push(assignmentId);
    }
    sql += ' ORDER BY asub.created_at DESC';

    const { results } = await db.prepare(sql).bind(...paramsArr).all<any>();

    const parsed = (results || []).map((r: any) => {
      let fileUrls: string[] = [];
      try { fileUrls = JSON.parse(r.file_urls || '[]'); } catch { /* ignore */ }
      return { ...r, file_urls: fileUrls };
    });

    return jsonResponse({ success: true, data: parsed });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
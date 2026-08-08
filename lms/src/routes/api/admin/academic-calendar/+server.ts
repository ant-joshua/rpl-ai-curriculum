import { getDB, jsonResponse } from '$lib/server/d1';

// GET /api/admin/academic-calendar?month=YYYY-MM — list events (admin)
export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }): Promise<Response> {
  try {
    const user = locals.user;
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }
    const tenantId = locals.tenant?.id || 'default';
    const db = getDB(platform);

    const month = url.searchParams.get('month');
    let sql = 'SELECT * FROM academic_calendar WHERE tenant_id = ?';
    const params: unknown[] = [tenantId];
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      sql += " AND (start_date LIKE ? OR end_date LIKE ?)";
      params.push(`${month}%`, `${month}%`);
    }
    sql += ' ORDER BY start_date ASC';
    const { results } = await db.prepare(sql).bind(...params).all<any>();
    return jsonResponse({ success: true, data: results || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

// POST /api/admin/academic-calendar — create event
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
  try {
    const user = locals.user;
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }
    const tenantId = locals.tenant?.id || 'default';
    const db = getDB(platform);
    const body = await request.json();

    if (!body.title || !body.start_date) {
      return jsonResponse({ success: false, error: 'title dan start_date wajib diisi' }, 400);
    }

    const id = crypto.randomUUID();
    await db.prepare(
      `INSERT INTO academic_calendar (id, tenant_id, title, event_type, start_date, end_date, description, color, all_day, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      tenantId,
      body.title,
      body.event_type || 'event',
      body.start_date,
      body.end_date || null,
      body.description || null,
      body.color || '#4F46E5',
      body.all_day !== undefined ? (body.all_day ? 1 : 0) : 1,
      user.id
    ).run();

    const created = await db.prepare('SELECT * FROM academic_calendar WHERE id = ?').bind(id).first() as any;
    return jsonResponse({ success: true, data: created }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
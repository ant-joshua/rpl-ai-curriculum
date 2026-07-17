import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const offeringId = url.searchParams.get('offering_id');

    let sql = `SELECT cs.*, co.name AS offering_name FROM course_schedules cs JOIN course_offerings co ON co.id = cs.course_offering_id`;
    const params: unknown[] = [];

    if (offeringId) {
      sql += ` WHERE cs.course_offering_id = ?`;
      params.push(offeringId);
    }

    sql += ` ORDER BY cs.start_time ASC`;

    const { results } = await db.prepare(sql).bind(...params).all<any>();
    return jsonResponse({ success: true, data: results || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const body = await request.json();
    const { course_offering_id, title, description, start_time, end_time, location, meeting_link } = body;

    if (!course_offering_id || !title || !start_time) {
      return jsonResponse({ success: false, error: 'course_offering_id, title, and start_time are required' }, 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.prepare(
      `INSERT INTO course_schedules (id, course_offering_id, title, description, start_time, end_time, location, meeting_link, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, course_offering_id, title, description || '', start_time, end_time || null, location || '', meeting_link || '', now).run();

    const row = await db.prepare('SELECT * FROM course_schedules WHERE id = ?').bind(id).first<any>();
    return jsonResponse({ success: true, data: row }, 201);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

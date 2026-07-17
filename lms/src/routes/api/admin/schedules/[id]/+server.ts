import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const row = await db.prepare('SELECT cs.*, co.name AS offering_name FROM course_schedules cs JOIN course_offerings co ON co.id = cs.course_offering_id WHERE cs.id = ?').bind(params.id).first<any>();
    if (!row) return jsonResponse({ success: false, error: 'Schedule not found' }, 404);
    return jsonResponse({ success: true, data: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    const existing = await db.prepare('SELECT * FROM course_schedules WHERE id = ?').bind(params.id).first<any>();
    if (!existing) return jsonResponse({ success: false, error: 'Schedule not found' }, 404);

    const body = await request.json();
    const merged = { ...existing, ...body };

    await db.prepare(
      `UPDATE course_schedules SET title = ?, description = ?, start_time = ?, end_time = ?, location = ?, meeting_link = ?
       WHERE id = ?`
    ).bind(
      merged.title, merged.description || '',
      merged.start_time, merged.end_time || null,
      merged.location || '', merged.meeting_link || '',
      params.id
    ).run();

    const row = await db.prepare('SELECT * FROM course_schedules WHERE id = ?').bind(params.id).first<any>();
    return jsonResponse({ success: true, data: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
  try {
    const db = getDB(platform);
    await db.prepare('DELETE FROM course_schedules WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

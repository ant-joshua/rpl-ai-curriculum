import { getDB, jsonResponse } from '$lib/server/d1';

// DELETE /api/admin/academic-calendar/[id] — remove event
export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }): Promise<Response> {
  try {
    const user = locals.user;
    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      return jsonResponse({ success: false, error: 'Forbidden' }, 403);
    }
    const tenantId = locals.tenant?.id || 'default';
    const db = getDB(platform);

    const existing = await db.prepare('SELECT id FROM academic_calendar WHERE id = ? AND tenant_id = ?').bind(params.id, tenantId).first() as any;
    if (!existing) return jsonResponse({ success: false, error: 'Event not found' }, 404);

    await db.prepare('DELETE FROM academic_calendar WHERE id = ?').bind(params.id).run();
    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}
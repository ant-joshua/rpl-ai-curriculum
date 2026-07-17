import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** POST /api/my/announcements/[id]/read — mark announcement as read */
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
  try {
    const token = getBearerToken(request);
    if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
    const session = await getSession(platform, token);
    if (!session) return jsonResponse({ success: false, error: 'Session expired' }, 401);

    const db = getDB(platform);
    const userId = session.user.id;

    // Check announcement exists
    const ann = await db.prepare('SELECT id FROM announcements WHERE id = ?').bind(params.id).first<any>();
    if (!ann) return jsonResponse({ success: false, error: 'Announcement not found' }, 404);

    // Upsert read
    await db.prepare(
      `INSERT OR IGNORE INTO announcement_reads (id, announcement_id, user_id, read_at) VALUES (?, ?, ?, ?)`
    ).bind(crypto.randomUUID(), params.id, userId, new Date().toISOString()).run();

    return jsonResponse({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return jsonResponse({ success: false, error: msg }, 500);
  }
}

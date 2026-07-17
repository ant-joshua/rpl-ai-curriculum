import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * GET /api/notifications/unread-count — lightweight endpoint for polling
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const db = getDB(platform);
		const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(userId).first<{ tenant_id: string }>();
		const tenantId = tenantRow?.tenant_id || 'default';

		const unreadRow = await db.prepare(
			'SELECT COUNT(*) as count FROM notifications WHERE tenant_id = ? AND user_id = ? AND is_read = 0'
		).bind(tenantId, userId).first<{ count: number }>();
		const unreadCount = unreadRow?.count ?? 0;

		// Also get latest 3 unread notifications for toast
		const { results: latest } = await db.prepare(
			'SELECT id, type, title, body, created_at FROM notifications WHERE tenant_id = ? AND user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 3'
		).bind(tenantId, userId).all<any>();

		return jsonResponse({
			success: true,
			unreadCount,
			latest: latest || [],
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

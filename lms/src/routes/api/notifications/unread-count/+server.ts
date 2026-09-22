import { authenticateRequest, apiOk, apiError } from '$lib/server/api';
import { getDB } from '$lib/server/d1';

/**
 * GET /api/notifications/unread-count — lightweight endpoint for polling
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const tenantId = (locals?.tenant as any)?.id || 'default';
		const db = getDB(platform);

		const unreadRow = await db.prepare(
			'SELECT COUNT(*) as count FROM notifications WHERE tenant_id = ? AND user_id = ? AND is_read = 0'
		).bind(tenantId, userId).first<{ count: number }>();
		const unreadCount = unreadRow?.count ?? 0;

		// Also get latest 3 unread notifications for toast
		const { results: latest } = await db.prepare(
			'SELECT id, type, title, body, created_at FROM notifications WHERE tenant_id = ? AND user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 3'
		).bind(tenantId, userId).all<any>();

		return apiOk({
			unreadCount,
			latest: latest || [],
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

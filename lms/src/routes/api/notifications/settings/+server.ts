import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/notifications/settings — get user notification preferences
 * PUT /api/notifications/settings — update user notification preferences
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

		const prefs = await NotificationRepository.getPreferences(platform, userId, tenantId);
		return jsonResponse({ success: true, data: prefs });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const db = getDB(platform);
		const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(userId).first<{ tenant_id: string }>();
		const tenantId = tenantRow?.tenant_id || 'default';

		const body = await request.json();
		if (!body.category) {
			return jsonResponse({ success: false, error: 'category wajib diisi' }, 400);
		}

		await NotificationRepository.updatePreferences(platform, userId, tenantId, {
			category: body.category,
			in_app: body.in_app ?? true,
			email: body.email ?? true,
			whatsapp: body.whatsapp ?? false,
		});
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

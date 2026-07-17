import { getBearerToken, getSession } from '$lib/server/auth';
import { jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * PUT /api/notifications/[id]/read — mark single notification as read
 * POST /api/notifications/[id]/read — alias for PUT
 */
export async function PUT({ request, platform, params }: { request: Request; platform: App.Platform; params: { id: string } }): Promise<Response> {
	return handleMarkRead(request, platform, params.id);
}

export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: { id: string } }): Promise<Response> {
	return handleMarkRead(request, platform, params.id);
}

async function handleMarkRead(request: Request, platform: App.Platform, notificationId: string): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const ok = await NotificationRepository.markAsRead(userId, notificationId, platform);
		if (!ok) {
			return jsonResponse({ success: false, error: 'Notifikasi tidak ditemukan' }, 404);
		}
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

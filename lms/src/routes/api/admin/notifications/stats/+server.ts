import { jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/admin/notifications/stats — queue statistics
 */
export async function GET({ platform, locals }: {
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const stats = await NotificationRepository.getQueueStats(platform, tenantId);
		return jsonResponse({ success: true, data: stats });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

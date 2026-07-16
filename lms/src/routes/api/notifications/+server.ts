import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const userId = locals.user?.id;
		if (!userId) return json({ success: false, error: 'Unauthorized' }, { status: 401 });

		const tenantId = locals.tenant?.id || 'default';
		const unreadOnly = url.searchParams.get('unread') === 'true';
		const notifications = await NotificationRepository.getUserNotifications(platform, userId, tenantId, { unreadOnly });
		const unreadCount = await NotificationRepository.getUnreadCount(platform, userId, tenantId);

		return json({ success: true, data: { notifications, unreadCount } });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

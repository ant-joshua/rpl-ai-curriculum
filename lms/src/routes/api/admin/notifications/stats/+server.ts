import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const stats = await NotificationRepository.getNotificationStats(platform, tenantId);
		return json({ success: true, data: stats });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

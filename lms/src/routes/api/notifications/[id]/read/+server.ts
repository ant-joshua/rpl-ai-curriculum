import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function POST({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const userId = locals.user?.id || locals.userId;

		if (!userId) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const repo = new NotificationRepository(platform);
		const result = await repo.markAsRead(userId, params.id);

		if (!result) {
			return json({ success: false, error: 'Notifikasi tidak ditemukan' }, { status: 404 });
		}

		return json({ success: true, data: result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

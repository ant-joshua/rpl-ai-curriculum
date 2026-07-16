import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const status = url.searchParams.get('status') || undefined;
		const recipientId = url.searchParams.get('recipientId') || undefined;
		const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;
		const notifications = await NotificationRepository.listNotifications(platform, tenantId, { status, recipientId, limit });
		return json({ success: true, data: notifications });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.channel_type || !body.body) {
			return json({ success: false, error: 'channel_type dan body wajib diisi' }, { status: 400 });
		}
		const notificationId = await NotificationRepository.queueNotification(platform, tenantId, {
			channel_type: body.channel_type,
			template_id: body.template_id,
			recipient_id: body.recipient_id,
			recipient_address: body.recipient_address,
			subject: body.subject,
			body: body.body,
			metadata: body.metadata ? JSON.stringify(body.metadata) : undefined
		});
		return json({ success: true, data: { id: notificationId } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

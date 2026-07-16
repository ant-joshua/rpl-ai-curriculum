import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const channels = await NotificationRepository.getChannels(platform, tenantId);
		return json({ success: true, data: channels });
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
		if (!body.name || !body.channel_type) {
			return json({ success: false, error: 'name dan channel_type wajib diisi' }, { status: 400 });
		}
		const channel = await NotificationRepository.createChannel(platform, tenantId, {
			name: body.name,
			channel_type: body.channel_type,
			provider: body.provider,
			config_json: body.config_json ? JSON.stringify(body.config_json) : undefined
		});
		return json({ success: true, data: channel }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

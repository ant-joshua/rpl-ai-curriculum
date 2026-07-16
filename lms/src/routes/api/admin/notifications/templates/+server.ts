import { json } from '@sveltejs/kit';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const templates = await NotificationRepository.getTemplates(platform, tenantId);
		return json({ success: true, data: templates });
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
		if (!body.name || !body.body_template) {
			return json({ success: false, error: 'name dan body_template wajib diisi' }, { status: 400 });
		}
		const template = await NotificationRepository.createTemplate(platform, tenantId, {
			name: body.name,
			category: body.category || 'system',
			channel_type: body.channel_type || 'in_app',
			subject: body.subject,
			body_template: body.body_template
		});
		return json({ success: true, data: template }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

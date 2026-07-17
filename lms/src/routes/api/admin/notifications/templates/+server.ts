import { jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/admin/notifications/templates — list all templates
 * POST /api/admin/notifications/templates — create
 */
export async function GET({ url, platform, locals }: {
	url: URL;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const type = url.searchParams.get('type') || undefined;
		const templates = await NotificationRepository.getTemplates(platform, tenantId, { type });
		return jsonResponse({ success: true, data: templates });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.code || !body.type || !body.body_template) {
			return jsonResponse({ success: false, error: 'code, type, dan body_template wajib diisi' }, 400);
		}
		const template = await NotificationRepository.createTemplate(platform, tenantId, {
			code: body.code,
			type: body.type,
			channels: body.channels,
			subject: body.subject,
			body_template: body.body_template,
			variables: body.variables ? JSON.stringify(body.variables) : undefined,
		});
		return jsonResponse({ success: true, data: template }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

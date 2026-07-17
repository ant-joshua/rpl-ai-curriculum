import { jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

export async function PUT({ request, platform, locals, params }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
	params: { id: string };
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		await NotificationRepository.updateTemplate(platform, params.id, tenantId, body);
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ platform, locals, params }: {
	platform: App.Platform;
	locals: Record<string, any>;
	params: { id: string };
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		await NotificationRepository.deleteTemplate(platform, params.id, tenantId);
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

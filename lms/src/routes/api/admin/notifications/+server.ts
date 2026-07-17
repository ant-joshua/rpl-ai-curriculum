import { getDB, jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * POST /api/admin/notifications — broadcast notification to all users in tenant
 * Body: { type, title, body?, reference_type?, reference_id?, channel? }
 */
export async function POST({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		if (!body.type || !body.title) {
			return jsonResponse({ success: false, error: 'type dan title wajib diisi' }, 400);
		}

		const validTypes = ['assessment','assignment','attendance','payment','grade','system','announcement'];
		if (!validTypes.includes(body.type)) {
			return jsonResponse({ success: false, error: 'Tipe notifikasi tidak valid' }, 400);
		}

		const count = await NotificationRepository.createNotificationForAllUsers(platform, tenantId, {
			type: body.type,
			title: body.title,
			body: body.body,
			reference_type: body.reference_type,
			reference_id: body.reference_id,
			channel: body.channel || 'in_app',
		});

		return jsonResponse({
			success: true,
			message: `Notifikasi terkirim ke ${count} pengguna`,
			data: { recipientCount: count }
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

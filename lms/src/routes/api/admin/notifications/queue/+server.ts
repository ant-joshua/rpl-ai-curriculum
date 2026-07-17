import { jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/admin/notifications/queue — list queue with filters
 * Query: status, channel, page, limit
 * POST /api/admin/notifications/queue — create queue entry
 * PUT /api/admin/notifications/queue — retry failed items
 */
export async function GET({ url, platform, locals }: {
	url: URL;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const status = url.searchParams.get('status') || undefined;
		const channel = url.searchParams.get('channel') || undefined;
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
		const offset = (page - 1) * limit;

		const result = await NotificationRepository.listQueue(platform, tenantId, { status, channel, limit, offset });
		return jsonResponse({
			success: true,
			data: result.rows,
			pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) }
		});
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
		if (!body.channel || !body.body) {
			return jsonResponse({ success: false, error: 'channel dan body wajib diisi' }, 400);
		}

		const id = await NotificationRepository.enqueue(platform, tenantId, {
			user_id: body.user_id,
			channel: body.channel,
			recipient: body.recipient,
			subject: body.subject,
			body: body.body,
			priority: body.priority,
			scheduled_at: body.scheduled_at,
		});
		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, platform, locals }: {
	request: Request;
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		if (body.action === 'retry-failed') {
			const count = await NotificationRepository.retryFailed(platform, tenantId, body.max);
			return jsonResponse({ success: true, message: `${count} notifikasi di-queue ulang`, data: { retried: count } });
		}

		return jsonResponse({ success: false, error: 'Action tidak dikenal' }, 400);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

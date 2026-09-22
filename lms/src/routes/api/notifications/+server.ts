import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';
import { getDB } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/notifications — list user notifications (paginated, filterable)
 * Query: page, limit, type, unread
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const tenantId = (locals?.tenant as any)?.id || 'default';

		const url = new URL(request.url);
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
		const offset = (page - 1) * limit;
		const type = url.searchParams.get('type') || undefined;
		const unreadOnly = url.searchParams.get('unread') === 'true';

		const result = await NotificationRepository.getUserNotifications(platform, userId, tenantId, {
			unreadOnly, type, limit, offset
		});

		return apiOk(result.rows, {
			meta: {
				pagination: {
					page,
					limit,
					total: result.total,
					totalPages: Math.ceil(result.total / limit)
				},
				unreadCount: result.unreadCount
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * PUT /api/notifications — mark notifications read
 * Body: { ids?: string[], all?: boolean }
 */
export async function PUT({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const tenantId = (locals?.tenant as any)?.id || 'default';

		const parsed = await parseJson<{ ids?: string[]; all?: boolean }>(request);
		if (parsed.response) return parsed.response;
		const body = parsed.data || {};

		if (body.all) {
			await NotificationRepository.markAllAsRead(userId, tenantId, platform);
			return apiOk({ markedAll: true });
		}
		if (body.ids && Array.isArray(body.ids)) {
			for (const id of body.ids) {
				await NotificationRepository.markAsRead(userId, id, platform);
			}
		}
		return apiOk({ updated: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * POST /api/notifications — create a notification (internal/API use)
 * Body: { user_id, type, title, body?, reference_type?, reference_id?, channel? }
 */
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const parsed = await parseJson<any>(request);
		if (parsed.response) return parsed.response;
		const body = parsed.data || {};

		if (!body.user_id || !body.type || !body.title) {
			return apiError('user_id, type, dan title wajib diisi', 400);
		}

		const validTypes = ['assessment','assignment','attendance','payment','grade','system','announcement'];
		if (!validTypes.includes(body.type)) {
			return apiError('Tipe notifikasi tidak valid', 400);
		}

		const db = getDB(platform);
		const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(body.user_id).first<{ tenant_id: string }>();
		const tenantId = tenantRow?.tenant_id || 'default';

		const notif = await NotificationRepository.createNotification(platform, {
			tenant_id: tenantId,
			user_id: body.user_id,
			type: body.type,
			title: body.title,
			body: body.body,
			reference_type: body.reference_type,
			reference_id: body.reference_id,
			channel: body.channel || 'in_app',
		});

		// Also enqueue in queue for email/whatsapp delivery if channel not in_app
		if (body.channel && body.channel !== 'in_app') {
			const user = await db.prepare('SELECT email, phone FROM users WHERE id = ?').bind(body.user_id).first<any>();
			await NotificationRepository.enqueue(platform, tenantId, {
				user_id: body.user_id,
				channel: body.channel,
				recipient: body.channel === 'email' ? user?.email : user?.phone,
				subject: body.title,
				body: body.body || body.title,
			});
		}

		return apiOk(notif, { status: 201 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * DELETE /api/notifications — archive a notification
 * Body: { id: string }
 */
export async function DELETE({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const parsed = await parseJson<{ id?: string }>(request);
		if (parsed.response) return parsed.response;
		const body = parsed.data || {};

		if (!body.id) {
			return apiError('id wajib diisi', 400);
		}

		await NotificationRepository.archiveNotification(userId, body.id, platform);
		return apiOk({ archived: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

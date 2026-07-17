import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';
import { NotificationRepository } from '$lib/repositories/notification.repository';

/**
 * GET /api/notifications — list user notifications (paginated, filterable)
 * Query: page, limit, type, unread
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const db = getDB(platform);
		const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(userId).first<{ tenant_id: string }>();
		const tenantId = tenantRow?.tenant_id || 'default';

		const url = new URL(request.url);
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
		const offset = (page - 1) * limit;
		const type = url.searchParams.get('type') || undefined;
		const unreadOnly = url.searchParams.get('unread') === 'true';

		const result = await NotificationRepository.getUserNotifications(platform, userId, tenantId, {
			unreadOnly, type, limit, offset
		});

		return jsonResponse({
			success: true,
			data: result.rows,
			pagination: {
				page,
				limit,
				total: result.total,
				totalPages: Math.ceil(result.total / limit)
			},
			unreadCount: result.unreadCount
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * PUT /api/notifications — mark notifications read
 * Body: { ids?: string[], all?: boolean }
 */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const db = getDB(platform);
		const tenantRow = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(userId).first<{ tenant_id: string }>();
		const tenantId = tenantRow?.tenant_id || 'default';

		const body = await request.json();
		if (body.all) {
			await NotificationRepository.markAllAsRead(userId, tenantId, platform);
			return jsonResponse({ success: true });
		}
		if (body.ids && Array.isArray(body.ids)) {
			for (const id of body.ids) {
				await NotificationRepository.markAsRead(userId, id, platform);
			}
		}
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * POST /api/notifications — create a notification (internal/API use)
 * Body: { user_id, type, title, body?, reference_type?, reference_id?, channel? }
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const body = await request.json();
		if (!body.user_id || !body.type || !body.title) {
			return jsonResponse({ success: false, error: 'user_id, type, dan title wajib diisi' }, 400);
		}

		const validTypes = ['assessment','assignment','attendance','payment','grade','system','announcement'];
		if (!validTypes.includes(body.type)) {
			return jsonResponse({ success: false, error: 'Tipe notifikasi tidak valid' }, 400);
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

		return jsonResponse({ success: true, data: notif }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * DELETE /api/notifications — archive a notification
 * Body: { id: string }
 */
export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const body = await request.json();
		if (!body.id) {
			return jsonResponse({ success: false, error: 'id wajib diisi' }, 400);
		}

		await NotificationRepository.archiveNotification(userId, body.id, platform);
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

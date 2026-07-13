import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		},
	});
}

/**
 * GET /api/notifications
 * List notifications for current user, paginated 20 per page.
 */
export async function GET({ request, platform, url }: { request: Request; platform: App.Platform; url: URL }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return json({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return json({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
		const limit = 20;
		const offset = (page - 1) * limit;

		const notifications = await db
			.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
			.bind(session.user.id, limit, offset)
			.all<any>();

		const countResult = await db
			.prepare('SELECT COUNT(*) as total FROM notifications WHERE user_id = ?')
			.bind(session.user.id)
			.first<{ total: number }>();

		const unreadResult = await db
			.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0')
			.bind(session.user.id)
			.first<{ count: number }>();

		return json({
			success: true,
			data: notifications.results || [],
			pagination: {
				page,
				limit,
				total: countResult?.total ?? 0,
				totalPages: Math.ceil((countResult?.total ?? 0) / limit),
			},
			unreadCount: unreadResult?.count ?? 0,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

/**
 * POST /api/notifications
 * Create a notification (admin only).
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return json({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return json({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return json({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const body = await request.json();
		const { user_id, type, title, body: notifBody, link } = body;

		if (!user_id || !type || !title) {
			return json({ success: false, error: 'Missing required fields: user_id, type, title' }, 400);
		}

		const validTypes = ['course_update', 'new_lesson', 'discussion_reply', 'assignment_grade', 'system', 'announcement'];
		if (!validTypes.includes(type)) {
			return json({ success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, 400);
		}

		const id = crypto.randomUUID();
		await db
			.prepare('INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, user_id, type, title, notifBody ?? null, link ?? null)
			.run();

		return json({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

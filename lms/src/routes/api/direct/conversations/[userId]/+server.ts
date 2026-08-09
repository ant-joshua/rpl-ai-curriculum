import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ params, request, platform }: { params: { userId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const partnerId = params.userId;

		// Verify partner exists
		const partner = await db
			.prepare('SELECT id, display_name, username, role FROM users WHERE id = ?')
			.bind(partnerId)
			.first<any>();
		if (!partner) return jsonResponse({ success: false, error: 'User not found' }, 404);

		// Fetch thread
		const messages = await db
			.prepare(`
				SELECT * FROM direct_messages
				WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
				ORDER BY created_at ASC
				LIMIT 200
			`)
			.bind(userId, partnerId, partnerId, userId)
			.all();

		// Mark incoming messages as read
		await db
			.prepare('UPDATE direct_messages SET read_at = ? WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL')
			.bind(new Date().toISOString(), partnerId, userId)
			.run();

		return jsonResponse({
			success: true,
			data: {
				partner: { id: partner.id, name: partner.display_name || partner.username || partner.id, role: partner.role },
				messages: messages.results || [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { userId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const partnerId = params.userId;
		const body = await request.json();
		const content = (body.content || '').toString().trim();

		if (!content) return jsonResponse({ success: false, error: 'Message content required' }, 400);
		if (userId === partnerId) return jsonResponse({ success: false, error: 'Cannot message yourself' }, 400);

		// Verify partner exists
		const partner = await db.prepare('SELECT id FROM users WHERE id = ?').bind(partnerId).first<any>();
		if (!partner) return jsonResponse({ success: false, error: 'User not found' }, 404);

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db
			.prepare('INSERT INTO direct_messages (id, tenant_id, sender_id, recipient_id, content, created_at) VALUES (?, ?, ?, ?, ?, ?)')
			.bind(id, session.user.tenant_id || null, userId, partnerId, content, now)
			.run();

		return jsonResponse({ success: true, data: { id, sender_id: userId, recipient_id: partnerId, content, created_at: now, read_at: null } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

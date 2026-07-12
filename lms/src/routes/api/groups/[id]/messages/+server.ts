import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { id } = params;

		// Check user is member
		const { results } = await db
			.prepare(`
				SELECT gm.*, COALESCE(u.username, gm.user_id) as username
				FROM group_messages gm
				LEFT JOIN users u ON u.id = gm.user_id
				WHERE gm.group_id = ?
				ORDER BY gm.created_at DESC
				LIMIT 50
			`)
			.bind(id)
			.all<any>();

		return json({ success: true, data: (results || []).reverse() });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const { id } = params;
		const body: { content?: string } = await request.json();

		if (!body.content || !body.content.trim()) {
			return json({ success: false, error: 'content required' }, 400);
		}

		// Check membership
		const member = await db
			.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, deviceId)
			.first();

		if (!member) {
			return json({ success: false, error: 'Not a member of this group' }, 403);
		}

		const msgId = `gmsg-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO group_messages (id, group_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)')
			.bind(msgId, id, deviceId, body.content.trim(), now)
			.run();

		return json({ success: true, data: { id: msgId, created_at: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

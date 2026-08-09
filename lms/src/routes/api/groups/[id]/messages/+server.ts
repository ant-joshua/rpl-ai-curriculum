import { getDB, jsonResponse, getDeviceId } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

async function resolveUserId(platform: App.Platform, request: Request): Promise<string> {
	const token = getTokenFromRequest(request);
	if (token) {
		const session = await getSession(platform, token);
		if (session?.user) return session.user.id;
	}
	return getDeviceId(request);
}

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { id } = params;

		const { results } = await db
			.prepare(`
				SELECT gm.id, gm.group_id, gm.user_id, gm.content, gm.created_at,
					COALESCE(u.username, u.display_name, gm.user_id) as username,
					COALESCE(u.role, '') as user_role
				FROM group_messages gm
				LEFT JOIN users u ON u.id = gm.user_id
				WHERE gm.group_id = ?
				ORDER BY gm.created_at DESC
				LIMIT 50
			`)
			.bind(id)
			.all<any>();

		return jsonResponse({ success: true, data: (results || []).reverse() });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const { id } = params;
		const body: { content?: string } = await request.json();

		if (!body.content || !body.content.trim()) {
			return jsonResponse({ success: false, error: 'content required' }, 400);
		}

		// Check membership
		const member = await db
			.prepare('SELECT role FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, userId)
			.first();

		if (!member) {
			return jsonResponse({ success: false, error: 'Not a member of this group' }, 403);
		}

		const msgId = `gmsg-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO group_messages (id, group_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)')
			.bind(msgId, id, userId, body.content.trim(), now)
			.run();

		return jsonResponse({ success: true, data: { id: msgId, created_at: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
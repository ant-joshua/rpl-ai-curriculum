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

// Resolve real user id from session when logged in; fall back to device id
async function resolveUserId(platform: App.Platform, request: Request): Promise<string> {
	const token = getTokenFromRequest(request);
	if (token) {
		const session = await getSession(platform, token);
		if (session?.user) return session.user.id;
	}
	return getDeviceId(request);
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);

		const { results } = await db
			.prepare(`
				SELECT sg.*,
					(SELECT COUNT(*) FROM group_members WHERE group_id = sg.id) as member_count,
					(SELECT COUNT(*) FROM group_members WHERE group_id = sg.id AND user_id = ?) as is_member,
					(SELECT COUNT(*) FROM group_members WHERE group_id = sg.id AND user_id = ? AND role = 'admin') as is_admin
				FROM study_groups sg
				ORDER BY sg.created_at DESC
			`)
			.bind(userId, userId)
			.all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const body: { name?: string; path_slug?: string; description?: string } = await request.json();

		if (!body.name || !body.path_slug) {
			return jsonResponse({ success: false, error: 'name and path_slug required' }, 400);
		}

		const id = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		await db
			.prepare('INSERT INTO study_groups (id, name, path_slug, description, created_by) VALUES (?, ?, ?, ?, ?)')
			.bind(id, body.name, body.path_slug, body.description || null, userId)
			.run();

		// Creator is automatically admin
		const memberId = `gm-${id}-${userId}`;
		await db
			.prepare('INSERT OR IGNORE INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)')
			.bind(memberId, id, userId, 'admin')
			.run();

		return jsonResponse({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
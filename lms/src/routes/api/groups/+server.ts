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

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);

		// List all groups with member count and whether user is member
		const { results } = await db
			.prepare(`
				SELECT sg.*,
					(SELECT COUNT(*) FROM group_members WHERE group_id = sg.id) as member_count,
					(SELECT COUNT(*) FROM group_members WHERE group_id = sg.id AND user_id = ?) as is_member
				FROM study_groups sg
				ORDER BY sg.created_at DESC
			`)
			.bind(deviceId)
			.all<any>();

		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body: { name?: string; path_slug?: string; description?: string } = await request.json();

		if (!body.name || !body.path_slug) {
			return json({ success: false, error: 'name and path_slug required' }, 400);
		}

		const id = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

		await db
			.prepare('INSERT INTO study_groups (id, name, path_slug, description, created_by) VALUES (?, ?, ?, ?, ?)')
			.bind(id, body.name, body.path_slug, body.description || null, deviceId)
			.run();

		// Creator is automatically admin
		const memberId = `gm-${id}-${deviceId}`;
		await db
			.prepare('INSERT INTO group_members (id, group_id, user_id, role) VALUES (?, ?, ?, ?)')
			.bind(memberId, id, deviceId, 'admin')
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

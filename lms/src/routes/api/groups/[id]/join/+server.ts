import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const { id } = params;

		// Check group exists
		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();

		if (!group) {
			return json({ success: false, error: 'Group not found' }, 404);
		}

		// Check not already member
		const existing = await db
			.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, deviceId)
			.first();

		if (existing) {
			return json({ success: false, error: 'Already a member' }, 409);
		}

		const memberId = `gm-${id}-${deviceId}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO group_members (id, group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)')
			.bind(memberId, id, deviceId, 'member', now)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const { id } = params;

		await db
			.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, deviceId)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

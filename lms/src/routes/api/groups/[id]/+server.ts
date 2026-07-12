import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
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

		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();

		if (!group) {
			return json({ success: false, error: 'Group not found' }, 404);
		}

		const members = await db
			.prepare(`
				SELECT gm.*, u.username
				FROM group_members gm
				LEFT JOIN users u ON u.id = gm.user_id
				WHERE gm.group_id = ?
				ORDER BY gm.joined_at ASC
			`)
			.bind(id)
			.all<any>();

		return json({
			success: true,
			data: {
				...group,
				members: members?.results || [],
			},
		});
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

		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ? AND created_by = ?')
			.bind(id, deviceId)
			.first<any>();

		if (!group) {
			return json({ success: false, error: 'Not found or not creator' }, 404);
		}

		// Delete messages, members, then group
		await db.prepare('DELETE FROM group_messages WHERE group_id = ?').bind(id).run();
		await db.prepare('DELETE FROM group_members WHERE group_id = ?').bind(id).run();
		await db.prepare('DELETE FROM study_groups WHERE id = ?').bind(id).run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

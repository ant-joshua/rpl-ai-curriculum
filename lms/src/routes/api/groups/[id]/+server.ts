import { getDB, jsonResponse, getDeviceId } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
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

export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { id } = params;
		const userId = await resolveUserId(platform, request);

		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();

		if (!group) {
			return jsonResponse({ success: false, error: 'Group not found' }, 404);
		}

		const members = await db
			.prepare(`
				SELECT gm.*, u.username, u.display_name, u.role as user_role
				FROM group_members gm
				LEFT JOIN users u ON u.id = gm.user_id
				WHERE gm.group_id = ?
				ORDER BY gm.joined_at ASC
			`)
			.bind(id)
			.all<any>();

		// my role in this group
		const me = await db
			.prepare('SELECT role FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, userId)
			.first<any>();

		return jsonResponse({
			success: true,
			data: {
				...group,
				members: members?.results || [],
				my_role: me?.role || null,
				is_member: !!me,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const { id } = params;

		// Only creator or group admin can delete
		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();
		if (!group) {
			return jsonResponse({ success: false, error: 'Group not found' }, 404);
		}

		const myRole = await db
			.prepare('SELECT role FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, userId)
			.first<any>();

		const isCreator = group.created_by === userId;
		const isAdmin = myRole?.role === 'admin';
		if (!isCreator && !isAdmin) {
			return jsonResponse({ success: false, error: 'Only creator or admin can delete this group' }, 403);
		}

		await db.prepare('DELETE FROM group_messages WHERE group_id = ?').bind(id).run();
		await db.prepare('DELETE FROM group_members WHERE group_id = ?').bind(id).run();
		await db.prepare('DELETE FROM study_groups WHERE id = ?').bind(id).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
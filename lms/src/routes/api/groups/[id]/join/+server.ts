import { getDB, jsonResponse, getDeviceId } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const { id } = params;

		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();
		if (!group) {
			return jsonResponse({ success: false, error: 'Group not found' }, 404);
		}

		const existing = await db
			.prepare('SELECT * FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, userId)
			.first();
		if (existing) {
			return jsonResponse({ success: false, error: 'Already a member' }, 409);
		}

		const memberId = `gm-${id}-${userId}`;
		const now = new Date().toISOString();

		await db
			.prepare('INSERT INTO group_members (id, group_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, ?)')
			.bind(memberId, id, userId, 'member', now)
			.run();

		return jsonResponse({ success: true });
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

		// Creator cannot leave — must delete group instead
		const group = await db
			.prepare('SELECT * FROM study_groups WHERE id = ?')
			.bind(id)
			.first<any>();
		if (group?.created_by === userId) {
			return jsonResponse({ success: false, error: 'Creator cannot leave the group. Delete it instead.' }, 400);
		}

		await db
			.prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
			.bind(id, userId)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
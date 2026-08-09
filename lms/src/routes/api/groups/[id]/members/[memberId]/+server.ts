import { getDB, jsonResponse, getDeviceId } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
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

// Verify caller is admin of the group
async function isGroupAdmin(db: any, groupId: string, userId: string): Promise<boolean> {
	const me = (await db
		.prepare('SELECT role FROM group_members WHERE group_id = ? AND user_id = ?')
		.bind(groupId, userId)
		.first()) as any;
	return me?.role === 'admin';
}

// PATCH /api/groups/[id]/members/[memberId] — { role: 'admin' | 'member' }
export async function PATCH({ params, request, platform }: { params: { id: string; memberId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const { id, memberId } = params;
		const body: { role?: string } = await request.json();

		if (!body.role || !['admin', 'member'].includes(body.role)) {
			return jsonResponse({ success: false, error: 'role must be admin or member' }, 400);
		}

		if (!(await isGroupAdmin(db, id, userId))) {
			return jsonResponse({ success: false, error: 'Only group admin can manage members' }, 403);
		}

		// Cannot change own role
		const target = (await db
			.prepare('SELECT user_id, role FROM group_members WHERE id = ? AND group_id = ?')
			.bind(memberId, id)
			.first()) as any;
		if (!target) {
			return jsonResponse({ success: false, error: 'Member not found' }, 404);
		}
		if (target.user_id === userId) {
			return jsonResponse({ success: false, error: 'Cannot change your own role' }, 400);
		}

		// Group creator cannot be demoted
		const group = (await db.prepare('SELECT created_by FROM study_groups WHERE id = ?').bind(id).first()) as any;
		if (group?.created_by === target.user_id) {
			return jsonResponse({ success: false, error: 'Creator role cannot be changed' }, 400);
		}

		await db
			.prepare('UPDATE group_members SET role = ? WHERE id = ? AND group_id = ?')
			.bind(body.role, memberId, id)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// DELETE /api/groups/[id]/members/[memberId] — kick member
export async function DELETE({ params, request, platform }: { params: { id: string; memberId: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const userId = await resolveUserId(platform, request);
		const { id, memberId } = params;

		if (!(await isGroupAdmin(db, id, userId))) {
			return jsonResponse({ success: false, error: 'Only group admin can manage members' }, 403);
		}

		const target = (await db
			.prepare('SELECT user_id FROM group_members WHERE id = ? AND group_id = ?')
			.bind(memberId, id)
			.first()) as any;
		if (!target) {
			return jsonResponse({ success: false, error: 'Member not found' }, 404);
		}
		if (target.user_id === userId) {
			return jsonResponse({ success: false, error: 'Cannot kick yourself' }, 400);
		}

		// Group creator cannot be kicked
		const group = (await db.prepare('SELECT created_by FROM study_groups WHERE id = ?').bind(id).first()) as any;
		if (group?.created_by === target.user_id) {
			return jsonResponse({ success: false, error: 'Creator cannot be kicked' }, 400);
		}

		await db
			.prepare('DELETE FROM group_members WHERE id = ? AND group_id = ?')
			.bind(memberId, id)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}
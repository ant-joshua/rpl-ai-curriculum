import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// PATCH /api/curricula/[id] — update curriculum (admin only)
// Body: { name?, description?, authority?, is_default?, is_active?, metadata? }
export async function PATCH({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
		if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Admin only' }, 403);
		}

		const db = getDB(platform);
		const body = await request.json();
		const { name, description, authority, is_default, is_active, metadata } = body;

		const cur = await db.prepare('SELECT * FROM curricula WHERE id = ?').bind(params.id).first<any>();
		if (!cur) return jsonResponse({ success: false, error: 'Curriculum not found' }, 404);

		if (is_default) {
			await db.prepare('UPDATE curricula SET is_default = 0').run();
		}

		await db.prepare(
			`UPDATE curricula SET
			 name = COALESCE(?, name),
			 description = COALESCE(?, description),
			 authority = COALESCE(?, authority),
			 is_default = COALESCE(?, is_default),
			 is_active = COALESCE(?, is_active),
			 metadata = COALESCE(?, metadata)
			 WHERE id = ?`
		).bind(
			name || null, description ?? null, authority || null,
			is_default !== undefined ? (is_default ? 1 : 0) : null,
			is_active !== undefined ? (is_active ? 1 : 0) : null,
			metadata ? JSON.stringify(metadata) : null,
			params.id
		).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// DELETE /api/curricula/[id] — delete curriculum (admin only, not default)
export async function DELETE({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
		if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Admin only' }, 403);
		}

		const db = getDB(platform);
		const cur = await db.prepare('SELECT * FROM curricula WHERE id = ?').bind(params.id).first<any>();
		if (!cur) return jsonResponse({ success: false, error: 'Curriculum not found' }, 404);
		if (cur.is_default) return jsonResponse({ success: false, error: 'Cannot delete default curriculum' }, 400);

		// Unlink courses
		await db.prepare('UPDATE courses SET curriculum_id = NULL WHERE curriculum_id = ?').bind(params.id).run();
		await db.prepare('UPDATE course_offerings SET curriculum_id = NULL WHERE curriculum_id = ?').bind(params.id).run();
		await db.prepare('DELETE FROM curricula WHERE id = ?').bind(params.id).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

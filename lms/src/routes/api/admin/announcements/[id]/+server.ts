import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

export async function PUT({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const existing = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(params.id).first<any>();
		if (!existing) {
			return jsonResponse({ success: false, error: 'Announcement not found' }, 404);
		}

		const body = await request.json();
		const { title, body: announcementBody, priority, course_offering_id } = body;

		const updates: string[] = [];
		const values: any[] = [];

		if (title !== undefined) {
			updates.push('title = ?');
			values.push(title);
		}
		if (announcementBody !== undefined) {
			updates.push('body = ?');
			values.push(announcementBody);
		}
		if (priority !== undefined) {
			const validPriority = ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal';
			updates.push('priority = ?');
			values.push(validPriority);
		}
		if (course_offering_id !== undefined) {
			updates.push('course_offering_id = ?');
			values.push(course_offering_id);
		}

		if (updates.length === 0) {
			return jsonResponse({ success: false, error: 'No fields to update' }, 400);
		}

		updates.push("updated_at = datetime('now')");
		values.push(params.id);

		await db.prepare(`UPDATE announcements SET ${updates.join(', ')} WHERE id = ?`).bind(...values).run();

		const row = await db
			.prepare('SELECT a.*, u.display_name as creator_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = ?')
			.bind(params.id)
			.first();

		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const existing = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(params.id).first<any>();
		if (!existing) {
			return jsonResponse({ success: false, error: 'Announcement not found' }, 404);
		}

		await db.prepare('DELETE FROM announcements WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

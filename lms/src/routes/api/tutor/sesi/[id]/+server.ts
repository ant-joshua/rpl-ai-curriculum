import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const row = await db.prepare(
			'SELECT * FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();

		if (!row) throw error(404, 'Session not found');
		return json({ success: true, data: row });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const existing = await db.prepare(
			'SELECT * FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Session not found');

		const body = await request.json();
		const merged = { ...existing, ...body };

		// Recalculate duration if times changed
		if (body.date || body.start_time || body.end_time) {
			const date = merged.date;
			const start = merged.start_time;
			const end = merged.end_time;
			if (date && start && end) {
				const startDt = new Date(`${date}T${start}`);
				const endDt = new Date(`${date}T${end}`);
				merged.duration_minutes = Math.round((endDt.getTime() - startDt.getTime()) / 60000);
			}
		}

		const now = new Date().toISOString();
		await db.prepare(
			`UPDATE tutoring_sessions SET tutor_id=?, student_id=?, type=?, title=?, date=?, start_time=?, end_time=?, duration_minutes=?, room=?, status=?, notes=?, materials=?, updated_at=?
			 WHERE id=?`
		).bind(
			merged.tutor_id, merged.student_id, merged.type, merged.title,
			merged.date, merged.start_time, merged.end_time,
			merged.duration_minutes, merged.room, merged.status,
			merged.notes, merged.materials ? (typeof merged.materials === 'string' ? merged.materials : JSON.stringify(merged.materials)) : null,
			now, params.id
		).run();

		return json({ success: true, data: merged });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const existing = await db.prepare(
			'SELECT id FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Session not found');

		// Soft cancel — set status to cancelled
		const now = new Date().toISOString();
		await db.prepare(
			'UPDATE tutoring_sessions SET status = ?, updated_at = ? WHERE id = ?'
		).bind('cancelled', now, params.id).run();

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

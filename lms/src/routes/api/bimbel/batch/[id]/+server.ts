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

		const batch = await db.prepare(
			'SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!batch) throw error(404, 'Batch not found');

		// Get participants (enrolled students)
		const { results: participants } = await db.prepare(
			`SELECT be.*, u.display_name, u.email, u.username
			 FROM batch_enrollments be
			 JOIN users u ON u.id = be.user_id
			 WHERE be.batch_id = ? AND be.tenant_id = ?
			 ORDER BY u.display_name ASC`
		).bind(params.id, tenantId).all<any>();

		// Get session count
		const { results: sessions } = await db.prepare(
			'SELECT id, date, start_time, end_time, status, title FROM tutoring_sessions WHERE batch_id = ? AND tenant_id = ? ORDER BY date ASC'
		).bind(params.id, tenantId).all<any>();

		return json({
			success: true,
			data: {
				...batch,
				participants: participants || [],
				sessions: sessions || []
			}
		});
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
			'SELECT * FROM learning_packages WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Batch not found');

		const body = await request.json();
		const merged = { ...existing, ...body };

		await db.prepare(
			`UPDATE learning_packages SET name=?, description=?, duration_sessions=?, duration_days=?, price=?, max_students=?, subjects=?, status=?
			 WHERE id=?`
		).bind(
			merged.name, merged.description, merged.duration_sessions,
			merged.duration_days, merged.price, merged.max_students,
			merged.subjects ? (typeof merged.subjects === 'string' ? merged.subjects : JSON.stringify(merged.subjects)) : null,
			merged.status, params.id
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
			'SELECT id FROM learning_packages WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Batch not found');

		// Check for active enrollments
		const active = await db.prepare(
			'SELECT COUNT(*) AS cnt FROM batch_enrollments WHERE batch_id = ? AND status = ?'
		).bind(params.id, 'active').first<any>();
		if (active?.cnt > 0) {
			throw error(409, 'Cannot delete batch with active enrollments');
		}

		await db.prepare('DELETE FROM learning_packages WHERE id = ?').bind(params.id).run();
		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

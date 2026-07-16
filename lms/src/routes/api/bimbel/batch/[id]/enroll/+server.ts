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

export async function POST({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		// Verify batch exists
		const batch = await db.prepare(
			'SELECT id FROM learning_packages WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!batch) throw error(404, 'Batch not found');

		const body = await request.json();
		const { user_id, package_id, paid_amount } = body;
		if (!user_id) throw error(400, 'user_id required');

		// Check duplicate
		const dup = await db.prepare(
			'SELECT id FROM batch_enrollments WHERE batch_id = ? AND user_id = ?'
		).bind(params.id, user_id).first<any>();
		if (dup) throw error(409, 'Student already enrolled in this batch');

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO batch_enrollments (id, tenant_id, batch_id, user_id, package_id, enrollment_date, paid_amount, payment_status, remaining_sessions, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, params.id, user_id, package_id || null,
			now, paid_amount ?? null, body.payment_status || 'pending',
			body.remaining_sessions ?? null, 'active'
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		const { user_id } = body;
		if (!user_id) throw error(400, 'user_id required');

		const enrollment = await db.prepare(
			'SELECT id FROM batch_enrollments WHERE batch_id = ? AND user_id = ? AND tenant_id = ?'
		).bind(params.id, user_id, tenantId).first<any>();
		if (!enrollment) throw error(404, 'Enrollment not found');

		// Soft delete — set status to dropped
		await db.prepare(
			'UPDATE batch_enrollments SET status = ? WHERE id = ?'
		).bind('dropped', enrollment.id).run();

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

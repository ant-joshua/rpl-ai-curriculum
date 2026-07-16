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

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const batchId = url.searchParams.get('batch_id');
		const status = url.searchParams.get('status');

		let query = `
			SELECT be.*, u.display_name, u.email, u.username, lp.name AS package_name
			FROM batch_enrollments be
			JOIN users u ON u.id = be.user_id
			LEFT JOIN learning_packages lp ON lp.id = be.package_id
			WHERE be.tenant_id = ?
		`;
		const params: any[] = [tenantId];

		if (batchId) { query += ' AND be.batch_id = ?'; params.push(batchId); }
		if (status) { query += ' AND be.status = ?'; params.push(status); }

		query += ' ORDER BY be.enrollment_date DESC';

		const { results } = await db.prepare(query).bind(...params).all<any>();
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const { user_id, batch_id, package_id, paid_amount, remaining_sessions } = body;
		if (!user_id) throw error(400, 'user_id required');

		// Check duplicate
		if (batch_id) {
			const dup = await db.prepare(
				'SELECT id FROM batch_enrollments WHERE batch_id = ? AND user_id = ?'
			).bind(batch_id, user_id).first<any>();
			if (dup) throw error(409, 'Student already enrolled in this batch');
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO batch_enrollments (id, tenant_id, batch_id, user_id, package_id, enrollment_date, paid_amount, payment_status, remaining_sessions, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, batch_id || null, user_id, package_id || null,
			now, paid_amount ?? null, body.payment_status || 'pending',
			remaining_sessions ?? null, body.status || 'active'
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

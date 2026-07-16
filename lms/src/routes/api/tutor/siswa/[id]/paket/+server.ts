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

		// Get enrollment with package details
		const enrollment = await db.prepare(
			`SELECT be.*, lp.name AS package_name, lp.description AS package_description,
			 lp.type AS package_type, lp.duration_sessions, lp.duration_days, lp.price
			 FROM batch_enrollments be
			 LEFT JOIN learning_packages lp ON lp.id = be.package_id
			 WHERE be.id = ? AND be.tenant_id = ?`
		).bind(params.id, tenantId).first<any>();

		if (!enrollment) throw error(404, 'Enrollment not found');
		return json({ success: true, data: enrollment });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		// Verify enrollment exists
		const existing = await db.prepare(
			'SELECT id FROM batch_enrollments WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Enrollment not found');

		const body = await request.json();
		const { package_id, remaining_sessions, paid_amount, payment_status } = body;
		if (!package_id) throw error(400, 'package_id required');

		// Verify package exists
		const pkg = await db.prepare(
			'SELECT id, duration_sessions FROM learning_packages WHERE id = ? AND tenant_id = ?'
		).bind(package_id, tenantId).first<any>();
		if (!pkg) throw error(404, 'Package not found');

		// Assign package to enrollment
		const sessions = remaining_sessions ?? pkg.duration_sessions ?? 0;
		await db.prepare(
			'UPDATE batch_enrollments SET package_id = ?, remaining_sessions = ?, paid_amount = ?, payment_status = ? WHERE id = ?'
		).bind(package_id, sessions, paid_amount ?? null, payment_status || 'pending', params.id).run();

		return json({ success: true, data: { id: params.id } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

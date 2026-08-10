import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { BimbelRepository } from '$lib/repositories/bimbel.repository';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function POST({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);
		const body = await request.json();

		const batch = await repo.getBimbelBatches({ batchId: params.id });
		if (!batch || batch.length === 0) throw error(404, 'Batch not found');

		if (!body.user_id) throw error(400, 'user_id required');

		const dup = await db
			.prepare("SELECT id FROM batch_enrollments WHERE batch_id = ? AND user_id = ? AND status = 'active'")
			.bind(params.id, body.user_id)
			.first<any>();
		if (dup) throw error(409, 'Student already enrolled in this batch');

		const created = await repo.registerBimbelParticipant({
			batch_id: params.id,
			user_id: body.user_id,
			package_id: body.package_id,
			paid_amount: body.paid_amount,
			payment_status: body.payment_status,
			remaining_sessions: body.remaining_sessions
		});

		return json({ success: true, data: { id: created.id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);
		const body = await request.json();

		if (!body.user_id) throw error(400, 'user_id required');

		const enrollment = await db
			.prepare("SELECT id FROM batch_enrollments WHERE batch_id = ? AND user_id = ? AND tenant_id = ? AND status = 'active'")
			.bind(params.id, body.user_id, tenantId)
			.first<any>();
		if (!enrollment) throw error(404, 'Enrollment not found');

		await repo.unenrollBimbelParticipant(params.id, body.user_id);
		return json({ success: true, data: { id: enrollment.id } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

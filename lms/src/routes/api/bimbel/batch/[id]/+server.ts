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

export async function GET({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);

		const [batch] = await repo.getBimbelBatches({ batchId: params.id });
		if (!batch) throw error(404, 'Batch not found');

		const participants = await repo.getBimbelBatchEnrollments(params.id);

		const sessions = await db
			.prepare('SELECT id, date, start_time, end_time, status, title FROM tutoring_sessions WHERE batch_id = ? AND tenant_id = ? ORDER BY date ASC, start_time ASC')
			.bind(params.id, tenantId)
			.all<any>();

		return json({ success: true, data: { ...batch, participants: participants || [], sessions: sessions.results || [] } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);
		const body = await request.json();

		const existing = await repo.getBimbelBatches({ batchId: params.id });
		if (!existing || existing.length === 0) throw error(404, 'Batch not found');

		const updated = await repo.updateBimbelBatch(params.id, body);
		return json({ success: true, data: updated });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);

		const existing = await repo.getBimbelBatches({ batchId: params.id });
		if (!existing || existing.length === 0) throw error(404, 'Batch not found');

		const active = await db
			.prepare("SELECT COUNT(*) AS cnt FROM batch_enrollments WHERE batch_id = ? AND status = 'active'")
			.bind(params.id)
			.first<{ cnt: number }>();
		if ((active?.cnt ?? 0) > 0) throw error(409, 'Cannot delete batch with active enrollments');

		await repo.deleteBimbelBatch(params.id);
		return json({ success: true, data: { id: params.id } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

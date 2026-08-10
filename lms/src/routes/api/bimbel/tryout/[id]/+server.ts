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

		const tryout = await repo.getBatch(params.id);
		if (!tryout) throw error(404, 'Tryout not found');

		const participants = await repo.getParticipants(params.id);
		const analysis = await repo.getAnalysis(params.id);

		return json({ success: true, data: { ...tryout, participants: participants || [], analysis: analysis || [] } });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
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

		const existing = await repo.getBatch(params.id);
		if (!existing) throw error(404, 'Tryout not found');

		// updateBatch not in repo — inline SQL
		await db.prepare(
			`UPDATE tryout_batches SET batch_id=?, title=?, date=?, duration_minutes=?, question_count=?, subjects=? WHERE id=? AND tenant_id=?`
		).bind(
			body.batch_id !== undefined ? body.batch_id : existing.batch_id,
			body.title !== undefined ? body.title : existing.title,
			body.date !== undefined ? body.date : existing.date,
			body.duration_minutes !== undefined ? body.duration_minutes : existing.duration_minutes,
			body.question_count !== undefined ? body.question_count : existing.question_count,
			body.subjects !== undefined ? (Array.isArray(body.subjects) ? JSON.stringify(body.subjects) : body.subjects) : existing.subjects,
			params.id, tenantId
		).run();

		return json({ success: true, data: { id: params.id } });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

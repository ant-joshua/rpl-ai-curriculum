import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { ExamSchedulerRepository } from '$lib/repositories/exam-scheduler.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const data = await repo.getExam(params.id);
		if (!data) throw error(404, 'Ujian tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const body = await request.json();
		if (body.status && !['draft', 'published', 'ongoing', 'completed', 'cancelled'].includes(body.status)) {
			throw error(400, 'Status harus draft, published, ongoing, completed, atau cancelled');
		}
		const data = await repo.updateExam(params.id, body);
		if (!data) throw error(404, 'Ujian tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const deleted = await repo.deleteExam(params.id);
		if (!deleted) throw error(404, 'Ujian tidak ditemukan');
		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

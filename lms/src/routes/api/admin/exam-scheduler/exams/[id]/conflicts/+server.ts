import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { ExamSchedulerRepository } from '$lib/repositories/exam-scheduler.repository';

export async function GET({ params, url, platform, locals }: { params: { id: string }; url: URL; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const exam = await repo.getExam(params.id);
		if (!exam) throw error(404, 'Ujian tidak ditemukan');
		const excludeOwn = url.searchParams.get('exclude_own') !== 'false';
		const conflicts = await repo.detectAllConflicts(exam.exam_date, excludeOwn ? params.id : undefined);
		return json({ success: true, data: { exam_id: params.id, exam_date: exam.exam_date, has_conflicts: conflicts.length > 0, conflicts } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { ExamSchedulerRepository } from '$lib/repositories/exam-scheduler.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const exam = await repo.getExam(params.id);
		if (!exam) throw error(404, 'Ujian tidak ditemukan');
		const data = await repo.getExamParticipants(params.id);
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const exam = await repo.getExam(params.id);
		if (!exam) throw error(404, 'Ujian tidak ditemukan');
		const body = await request.json();
		if (!body.student_id) throw error(400, 'Student ID wajib diisi');
		if (body.status && !['registered', 'present', 'absent', 'excused'].includes(body.status)) {
			throw error(400, 'Status harus registered, present, absent, atau excused');
		}
		const data = await repo.addExamParticipant({
			exam_id: params.id,
			student_id: body.student_id,
			room_id: body.room_id,
			seat_number: body.seat_number,
			status: body.status,
			score: body.score,
			notes: body.notes
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

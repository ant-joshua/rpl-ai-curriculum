import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { ExamSchedulerRepository } from '$lib/repositories/exam-scheduler.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const filters = {
			exam_type_id: url.searchParams.get('exam_type_id') || undefined,
			subject_id: url.searchParams.get('subject_id') || undefined,
			class_id: url.searchParams.get('class_id') || undefined,
			status: url.searchParams.get('status') || undefined,
			exam_date: url.searchParams.get('exam_date') || undefined,
			exam_date_from: url.searchParams.get('exam_date_from') || url.searchParams.get('date_from') || undefined,
			exam_date_to: url.searchParams.get('exam_date_to') || url.searchParams.get('date_to') || undefined,
			room_id: url.searchParams.get('room_id') || undefined
		};
		const data = await repo.listExams(filters);
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const body = await request.json();
		if (!body.title) throw error(400, 'Judul ujian wajib diisi');
		if (!body.exam_type_id) throw error(400, 'Tipe ujian wajib diisi');
		if (!body.subject_id) throw error(400, 'Mata pelajaran wajib diisi');
		if (!body.class_id) throw error(400, 'Kelas wajib diisi');
		if (!body.exam_date) throw error(400, 'Tanggal ujian wajib diisi');
		if (!body.start_time) throw error(400, 'Jam mulai wajib diisi');
		if (!body.end_time) throw error(400, 'Jam selesai wajib diisi');
		if (!body.room_id) throw error(400, 'Ruangan wajib diisi');
		if (body.status && !['draft', 'published', 'ongoing', 'completed', 'cancelled'].includes(body.status)) {
			throw error(400, 'Status harus draft, published, ongoing, completed, atau cancelled');
		}
		const data = await repo.createExam({
			exam_type_id: body.exam_type_id,
			subject_id: body.subject_id,
			class_id: body.class_id,
			title: body.title,
			description: body.description,
			exam_date: body.exam_date,
			start_time: body.start_time,
			end_time: body.end_time,
			room_id: body.room_id,
			proctor_id: body.proctor_id,
			max_participants: body.max_participants,
			status: body.status,
			notes: body.notes
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { TutorRepository } from '$lib/repositories/tutor.repository';

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
		const repo = new TutorRepository(db, tenantId);

		const tutorId = url.searchParams.get('tutor_id') || undefined;
		const studentId = url.searchParams.get('student_id') || undefined;
		const date = url.searchParams.get('date') || undefined;
		const status = url.searchParams.get('status') || undefined;

		const results = await repo.getSessions({ tutorId, studentId, date, status });
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
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		if (!body.tutor_id || !body.date || !body.start_time || !body.end_time) {
			throw error(400, 'tutor_id, date, start_time, end_time required');
		}

		const conflict = await repo.checkConflict(
			body.tutor_id,
			body.date,
			body.start_time,
			body.end_time
		);
		if (conflict) {
			throw error(409, 'Tutor already has a session at this time');
		}

		const created = await repo.createSession({
			batch_id: body.batch_id || undefined,
			tutor_id: body.tutor_id,
			student_id: body.student_id || undefined,
			type: body.type || 'privat_1on1',
			title: body.title || undefined,
			date: body.date,
			start_time: body.start_time,
			end_time: body.end_time,
			duration_minutes: body.duration_minutes ?? undefined,
			room: body.room || undefined,
			status: body.status || 'scheduled',
			notes: body.notes || undefined,
			materials: body.materials || undefined,
			homework: body.homework || undefined
		});

		return json({ success: true, data: created }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

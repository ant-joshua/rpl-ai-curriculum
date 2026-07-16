import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { AttendanceRepository } from '$lib/repositories/attendance.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'instructor', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const classId = url.searchParams.get('class_id');
		const date = url.searchParams.get('date');
		const subjectId = url.searchParams.get('subject_id');

		if (!classId || !date) {
			throw error(400, 'class_id dan date wajib diisi');
		}

		const repo = new AttendanceRepository(db, tenantId);
		const data = await repo.getByClassAndDate(classId, date, subjectId || undefined);

		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'instructor', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		const { class_id, date, subject_id, records } = body;

		if (!class_id || !date || !records || !Array.isArray(records)) {
			throw error(400, 'class_id, date, dan records wajib diisi');
		}

		// Validate academic_period_id for recap
		const academicPeriodId = body.academic_period_id;
		if (!academicPeriodId) {
			throw error(400, 'academic_period_id wajib diisi untuk perhitungan rekap');
		}

		const repo = new AttendanceRepository(db, tenantId);

		// Save batch
		await repo.saveBatch({
			class_id,
			date,
			subject_id: subject_id || null,
			records,
			documented_by: body.documented_by || user.id,
			recorded_by: user.id
		});

		// Compute recap for each student
		const recordUserId = new Set<string>();
		for (const r of records) {
			recordUserId.add(r.user_id);
		}

		const dt = new Date(date);
		const year = dt.getFullYear();
		const month = dt.getMonth() + 1;

		for (const uid of recordUserId) {
			await repo.computeRecap(uid, academicPeriodId, month, year);
		}

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

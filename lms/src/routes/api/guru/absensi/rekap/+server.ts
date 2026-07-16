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
		const yearParam = url.searchParams.get('year');
		const monthParam = url.searchParams.get('month');

		if (!classId || !yearParam || !monthParam) {
			throw error(400, 'class_id, year, dan month wajib diisi');
		}

		const year = parseInt(yearParam, 10);
		const month = parseInt(monthParam, 10);

		if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
			throw error(400, 'year dan month harus angka valid');
		}

		const repo = new AttendanceRepository(db, tenantId);
		const data = await repo.getMonthlyAttendance(classId, year, month);

		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

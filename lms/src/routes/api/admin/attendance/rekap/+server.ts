import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { AttendanceRepository } from '$lib/repositories/attendance.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
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

		// Get monthly calendar view
		const calendar = await repo.getMonthlyAttendance(classId, year, month);

		// Get class info + student recap summaries
		const daysInMonth = new Date(year, month, 0).getDate();
		const monthStr = String(month).padStart(2, '0');
		const startDate = `${year}-${monthStr}-01`;
		const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

		const summary = await db.prepare(`
			SELECT
				cm.user_id,
				cm.nis,
				u.display_name,
				COALESCE(SUM(CASE WHEN a.status IN ('hadir','terlambat') THEN 1 ELSE 0 END), 0) AS total_hadir,
				COALESCE(SUM(CASE WHEN a.status = 'sakit' THEN 1 ELSE 0 END), 0) AS total_sakit,
				COALESCE(SUM(CASE WHEN a.status = 'izin' THEN 1 ELSE 0 END), 0) AS total_izin,
				COALESCE(SUM(CASE WHEN a.status = 'alpha' THEN 1 ELSE 0 END), 0) AS total_alpha,
				COALESCE(SUM(CASE WHEN a.status = 'dispensasi' THEN 1 ELSE 0 END), 0) AS total_dispensasi,
				COALESCE(SUM(CASE WHEN a.status = 'terlambat' THEN 1 ELSE 0 END), 0) AS total_terlambat
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			LEFT JOIN attendance a ON a.user_id = cm.user_id AND a.class_id = cm.class_id AND a.date >= ? AND a.date <= ? AND a.tenant_id = ?
			WHERE cm.class_id = ? AND cm.role = 'student'
			GROUP BY cm.user_id, cm.nis, u.display_name
			ORDER BY cm.nis
		`).bind(startDate, endDate, tenantId, classId).all<any>();

		// Get class info
		const classInfo = await db.prepare(`
			SELECT c.*, gl.name AS grade_level_name, m.name AS major_name
			FROM classes c
			LEFT JOIN grade_levels gl ON gl.id = c.grade_level_id
			LEFT JOIN majors m ON m.id = c.major_id
			WHERE c.id = ? AND c.tenant_id = ?
		`).bind(classId, tenantId).first<any>();

		return json({
			success: true,
			data: {
				class: classInfo || null,
				calendar,
				summary: summary.results || []
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

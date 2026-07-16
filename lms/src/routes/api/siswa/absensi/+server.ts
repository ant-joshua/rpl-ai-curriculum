import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { AttendanceRepository } from '$lib/repositories/attendance.repository';

export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			throw error(401, 'Unauthorized — Bearer token required');
		}

		const session = await getSession(platform, token);
		if (!session) {
			throw error(401, 'Unauthorized — invalid or expired token');
		}

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['student', 'admin', 'superadmin'].includes(user.role)) {
			throw error(403, 'Forbidden — role must be student, admin, or superadmin');
		}

		const tenantId = url.searchParams.get('tenant_id') || 'default';

		const academicPeriodId = url.searchParams.get('academic_period_id');
		const yearParam = url.searchParams.get('year');
		const monthParam = url.searchParams.get('month');

		if (!academicPeriodId || !yearParam || !monthParam) {
			throw error(400, 'academic_period_id, year, dan month wajib diisi');
		}

		const year = parseInt(yearParam, 10);
		const month = parseInt(monthParam, 10);

		if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
			throw error(400, 'year dan month harus angka valid');
		}

		const repo = new AttendanceRepository(db, tenantId);

		// Get student's recap
		const recap = await repo.getRecap(user.id, academicPeriodId, month, year);

		// Get recent absences for current month
		const daysInMonth = new Date(year, month, 0).getDate();
		const monthStr = String(month).padStart(2, '0');
		const startDate = `${year}-${monthStr}-01`;
		const endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

		const recentAbsences = await db.prepare(`
			SELECT date, status, reason, minutes_late, time_in, subject_id
			FROM attendance
			WHERE user_id = ? AND tenant_id = ? AND date >= ? AND date <= ?
			ORDER BY date ASC
		`).bind(user.id, tenantId, startDate, endDate).all<any>();

		return json({
			success: true,
			data: {
				recap: recap || null,
				recent_absences: recentAbsences.results || []
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

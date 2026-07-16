import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalSessions = await db
			.prepare('SELECT COUNT(*) as count FROM attendance_sessions')
			.first<{ count: number }>();

		const totalCheckIns = await db
			.prepare('SELECT COUNT(*) as count FROM attendance_records')
			.first<{ count: number }>();

		const totalExceptions = await db
			.prepare('SELECT COUNT(*) as count FROM attendance_exceptions')
			.first<{ count: number }>();

		const attendanceRate = await db
			.prepare(
				`SELECT
					(CAST(SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) AS REAL) /
					CAST(COUNT(*) AS REAL)) * 100 as rate
				 FROM attendance_records`,
			)
			.first<{ rate: number | null }>();

		const topAbsentStudents = await db
			.prepare(
				`SELECT ar.student_id, u.display_name as student_name, COUNT(*) as absent_count
				 FROM attendance_records ar
				 LEFT JOIN users u ON ar.student_id = u.id
				 WHERE ar.status = 'absent'
				 GROUP BY ar.student_id
				 ORDER BY absent_count DESC
				 LIMIT 10`,
			)
			.all();

		return jsonResponse({
			success: true,
			data: {
				totalSessions: totalSessions?.count ?? 0,
				totalCheckIns: totalCheckIns?.count ?? 0,
				totalExceptions: totalExceptions?.count ?? 0,
				avgAttendanceRate: attendanceRate?.rate ?? 0,
				topAbsentStudents: topAbsentStudents.results ?? [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

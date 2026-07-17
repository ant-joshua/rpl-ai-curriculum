import { getDB } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, url, platform }: {
	request: Request; url: URL; platform: App.Platform
}): Promise<Response> {
	try {
		const token = getBearerToken(request) || url.searchParams.get('token');
		if (!token) return new Response('Unauthorized', { status: 401 });
		const session = await getSession(platform, token);
		if (!session || !['admin', 'superadmin'].includes(session.user.role))
			return new Response('Forbidden', { status: 403 });

		const db = getDB(platform);
		const format = url.searchParams.get('format') || 'overview';
		const startDate = url.searchParams.get('start') || '2000-01-01';
		const endDate = url.searchParams.get('end') || '2099-12-31';

		let rows: any[] = [];
		let headers: string[] = [];
		let filename = 'analytics-export.csv';

		if (format === 'enrollments') {
			const { results } = await db.prepare(
				`SELECT DATE(e.enrolled_at) as date, co.name as offering_name, c.title as course_title,
				        u.display_name, u.email, e.status
				 FROM enrollments e
				 JOIN course_offerings co ON co.id = e.course_offering_id
				 JOIN courses c ON c.id = co.course_id
				 JOIN users u ON u.id = e.user_id
				 WHERE e.enrolled_at >= ? AND e.enrolled_at <= ?
				 ORDER BY e.enrolled_at DESC`
			).bind(startDate, endDate).all<any>();
			rows = results || [];
			headers = ['Date', 'Offering', 'Course', 'Student', 'Email', 'Status'];
			filename = 'enrollments.csv';
		} else if (format === 'grades') {
			const { results } = await db.prepare(
				`SELECT asub.submitted_at as date, u.display_name as student, u.email,
				        a.title as assessment, asub.score, asub.max_score,
				        co.name as offering_name
				 FROM assessment_submissions asub
				 JOIN assessments a ON a.id = asub.assessment_id
				 JOIN course_offerings co ON co.id = a.course_offering_id
				 JOIN users u ON u.id = asub.user_id
				 WHERE asub.score IS NOT NULL AND asub.status = 'graded'
				   AND asub.submitted_at >= ? AND asub.submitted_at <= ?
				 ORDER BY asub.submitted_at DESC`
			).bind(startDate, endDate).all<any>();
			rows = results || [];
			headers = ['Date', 'Student', 'Email', 'Assessment', 'Score', 'Max Score', 'Course'];
			filename = 'grades.csv';
		} else if (format === 'attendance') {
			const { results } = await db.prepare(
				`SELECT a_s.date, a_s.start_time, co.name as offering_name,
				        u.display_name as student, ar.status
				 FROM attendance_records ar
				 JOIN attendance_sessions a_s ON a_s.id = ar.session_id
				 JOIN course_offerings co ON co.id = a_s.course_offering_id
				 JOIN users u ON u.id = ar.user_id
				 WHERE a_s.date >= ? AND a_s.date <= ?
				 ORDER BY a_s.date DESC`
			).bind(startDate, endDate).all<any>();
			rows = results || [];
			headers = ['Date', 'Time', 'Course', 'Student', 'Status'];
			filename = 'attendance.csv';
		} else {
			// Overview export
			const { results } = await db.prepare(
				`SELECT u.display_name as student, u.email, u.role,
				        co.name as offering_name, e.status as enrollment_status,
				        e.enrolled_at, e.completed_at
				 FROM enrollments e
				 JOIN users u ON u.id = e.user_id
				 JOIN course_offerings co ON co.id = e.course_offering_id
				 WHERE e.enrolled_at >= ? AND e.enrolled_at <= ?
				 ORDER BY e.enrolled_at DESC`
			).bind(startDate, endDate).all<any>();
			rows = results || [];
			headers = ['Student', 'Email', 'Role', 'Course', 'Status', 'Enrolled At', 'Completed At'];
			filename = 'analytics-overview.csv';
		}

		// Build CSV
		const csvRows = [headers.join(',')];
		for (const row of rows) {
			const vals = headers.map(h => {
				const key = h.toLowerCase().replace(/\s+/g, '_');
				const val = (row as any)[key] ?? (row as any)[h] ?? '';
				const str = String(val).replace(/"/g, '""');
				return `"${str}"`;
			});
			csvRows.push(vals.join(','));
		}

		return new Response(csvRows.join('\n'), {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="${filename}"`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return new Response(msg, { status: 500 });
	}
}

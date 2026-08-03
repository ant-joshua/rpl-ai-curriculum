import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/my/progress/export?format=json|csv — export full learning progress
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const url = new URL(request.url);
		const format = url.searchParams.get('format') || 'json';

		// Enrollments with course info + progress
		const { results: enrollments } = await db.prepare(
			`SELECT e.id, e.status, e.enrolled_at, e.completed_at,
			        co.name AS course_name, co.code AS course_code,
			        (SELECT COUNT(*) FROM lessons l WHERE l.course_offering_id = co.id AND l.status = 'published') AS total_lessons,
			        (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = e.user_id AND lc.course_offering_id = co.id) AS completed_lessons
			 FROM enrollments e
			 JOIN course_offerings co ON co.id = e.course_offering_id
			 WHERE e.user_id = ?
			 ORDER BY e.enrolled_at DESC`
		).bind(userId).all<any>();

		// XP + level
		const xpRow = await db.prepare(
			'SELECT total_xp, level FROM user_gamification WHERE user_id = ?'
		).bind(userId).first<any>();

		// Certificates
		const { results: certificates } = await db.prepare(
			`SELECT c.cert_number, c.issued_at, c.metadata
			 FROM certificates c WHERE c.user_id = ?
			 ORDER BY c.issued_at DESC`
		).bind(userId).all<any>();

		// Recent activity
		const { results: activity } = await db.prepare(
			`SELECT action, created_at FROM activity_logs WHERE user_id = ?
			 ORDER BY created_at DESC LIMIT 50`
		).bind(userId).all<any>();

		const data = {
			exported_at: new Date().toISOString(),
			user: { id: userId, name: session.user.display_name || session.user.name || '' },
			gamification: {
				total_xp: xpRow?.total_xp || 0,
				level: xpRow?.level || 1,
			},
			enrollments: (enrollments || []).map((e: any) => ({
				course: e.course_name,
				code: e.course_code,
				status: e.status,
				enrolled_at: e.enrolled_at,
				completed_at: e.completed_at,
				total_lessons: Number(e.total_lessons) || 0,
				completed_lessons: Number(e.completed_lessons) || 0,
				progress_percent: Number(e.total_lessons)
					? Math.round((Number(e.completed_lessons) / Number(e.total_lessons)) * 100)
					: 0,
			})),
			certificates: (certificates || []).map((c: any) => {
				let meta: any = {};
				try { meta = JSON.parse(c.metadata || '{}'); } catch { /* ignore */ }
				return { cert_number: c.cert_number, issued_at: c.issued_at, course: meta.courseTitle || '' };
			}),
			recent_activity: (activity || []).map((a: any) => ({ action: a.action, at: a.created_at })),
		};

		if (format === 'csv') {
			const csvRows = [
				['Course', 'Code', 'Status', 'Enrolled At', 'Completed At', 'Total Lessons', 'Completed Lessons', 'Progress %'],
				...data.enrollments.map((e: any) => [
					e.course, e.code, e.status, e.enrolled_at, e.completed_at,
					e.total_lessons, e.completed_lessons, e.progress_percent,
				]),
			];
			const csv = csvRows.map((r: any[]) => r.map((c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
			return new Response(csv, {
				headers: {
					'Content-Type': 'text/csv; charset=utf-8',
					'Content-Disposition': `attachment; filename="learning-progress-${userId.slice(0, 8)}.csv"`,
				},
			});
		}

		return jsonResponse({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

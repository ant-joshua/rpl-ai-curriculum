import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { analyzeGrades } from '$lib/server/aiedu';

// GET /api/instructor/rapor-batch?offering_id=xxx — fetch all students + grades for batch rapor
// POST /api/instructor/rapor-batch — generate rapor for all students (AI per-student summaries)
export async function GET({ request, platform, url }: { request: Request; platform: App.Platform; url: URL }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const role = session.user?.role || '';
		if (!['instructor', 'admin', 'superadmin'].includes(role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const offeringId = url.searchParams.get('offering_id');
		if (!offeringId) return jsonResponse({ success: false, error: 'offering_id required' }, 400);

		const db = getDB(platform);
		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// All active students
		const { results: enrollments } = await db.prepare(
			`SELECT e.user_id, u.display_name, u.email, u.username
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.status = 'active'
			 ORDER BY u.display_name ASC`
		).bind(offeringId).all<any>();

		// All assessments for offering
		const { results: assessments } = await db.prepare(
			'SELECT id, title FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(offeringId).all<any>();

		// All submissions
		const { results: submissions } = await db.prepare(
			`SELECT user_id, assessment_id, score, max_score, status
			 FROM assessment_submissions
			 WHERE assessment_id IN (SELECT id FROM assessments WHERE course_offering_id = ?)
			 ORDER BY created_at ASC`
		).bind(offeringId).all<any>();

		// Gradebook rows
		const { results: gradebookRows } = await db.prepare(
			`SELECT g.* FROM gradebook g
			 JOIN enrollments e ON e.user_id = g.user_id AND e.course_offering_id = ?
			 WHERE e.status = 'active'`
		).bind(offeringId).all<any>();

		return jsonResponse({
			success: true,
			data: {
				offering: { id: offering.id, name: offering.name, code: offering.code },
				students: enrollments || [],
				assessments: assessments || [],
				submissions: submissions || [],
				gradebook: gradebookRows || [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// POST — generate AI rapor text per student (batch)
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const role = session.user?.role || '';
		if (!['instructor', 'admin', 'superadmin'].includes(role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const { offering_id, students } = body;
		if (!offering_id || !students?.length) {
			return jsonResponse({ success: false, error: 'offering_id and students required' }, 400);
		}

		const db = getDB(platform);
		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(offering_id).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		const results: any[] = [];
		for (const s of students) {
			try {
				// Fetch this student's grades
				const { results: submissions } = await db.prepare(
					`SELECT asub.assessment_id, asub.score, asub.max_score, asub.status, a.title, a.type
					 FROM assessment_submissions asub
					 JOIN assessments a ON a.id = asub.assessment_id
					 WHERE asub.user_id = ? AND a.course_offering_id = ?`
				).bind(s.user_id, offering_id).all<any>();

				const graded = (submissions || []).filter((x: any) => x.status === 'graded' && x.score != null);
				const scores = graded.map((x: any) => (x.max_score ? (x.score / x.max_score) * 100 : x.score));
				const avgPct = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

				// AI generate rapor description
				const subject = offering.name || '';
				const gradeLevel = offering.grade || '';
				let raporText = '';
				try {
					raporText = await analyzeGrades(
						platform, 'Kurikulum Merdeka', subject, gradeLevel, '',
						{
							students: [s.display_name || s.username || 'Siswa'],
							scores: scores.length ? [scores] : [],
						} as any
					);
				} catch (e) {
					raporText = `Rata-rata: ${avgPct.toFixed(1)}% dari ${scores.length} penilaian.`;
				}

				results.push({
					user_id: s.user_id,
					name: s.display_name || s.username || s.email || 'Siswa',
					email: s.email,
					avg_pct: Math.round(avgPct * 10) / 10,
					assessment_count: scores.length,
					rapor_text: raporText,
				});
			} catch (e) {
				results.push({ user_id: s.user_id, name: s.display_name || 'Siswa', error: e instanceof Error ? e.message : 'Gagal' });
			}
		}

		return jsonResponse({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/analyze-gradebook?offering_id=xxx
// Returns structured grade data for a course offering, ready for AI analysis.
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const url = new URL(request.url);
		const offering_id = url.searchParams.get('offering_id');
		if (!offering_id) return jsonResponse({ success: false, error: 'offering_id required' }, 400);

		const db = getDB(platform);

		// Get course info (subject)
		const offering = await db.prepare(
			'SELECT c.subject, c.code FROM course_offerings co JOIN courses c ON co.course_id = c.id WHERE co.id = ?'
		).bind(offering_id).first<any>();

		// Get enrolled students
		const enrollments = await db.prepare(
			'SELECT u.id, u.name FROM enrollments e JOIN users u ON e.user_id = u.id WHERE e.course_offering_id = ? AND e.status = ?'
		).bind(offering_id, 'active').all<any>();
		const students = enrollments.results || [];

		if (students.length === 0) {
			return jsonResponse({ success: true, data: { subject: offering?.subject || '', students: [], assessments: [], scores: [] } });
		}

		// Get all gradebook entries for this offering
		const grades = await db.prepare(
			'SELECT user_id, score, max_score, weight, assessment_submission_id, assignment_submission_id, graded_at FROM gradebook WHERE course_offering_id = ?'
		).bind(offering_id).all<any>();
		const gradeRows = grades.results || [];

		// Try to get assessment/assignment names for context
		const assessmentNames = await db.prepare(
			`SELECT DISTINCT a.id, a.title FROM assessment_submissions asub
			 JOIN assessments a ON asub.assessment_id = a.id
			 WHERE asub.course_offering_id = ?`
		).bind(offering_id).all<any>();
		const assignmentNames = await db.prepare(
			`SELECT DISTINCT a.id, a.title FROM assignment_submissions asub
			 JOIN assignments a ON asub.assignment_id = a.id
			 WHERE asub.course_offering_id = ?`
		).bind(offering_id).all<any>();

		// Build assessment labels from gradebook
		const assessmentLabels = (assessmentNames.results || []).map((a: any) => a.title || 'Asesmen');
		const assignmentLabels = (assignmentNames.results || []).map((a: any) => a.title || 'Tugas');

		return jsonResponse({
			success: true,
			data: {
				subject: offering?.subject || '',
				course_code: offering?.code || '',
				offering_id,
				students,
				assessment_labels: [...assessmentLabels, ...assignmentLabels],
				grades: gradeRows.map((g: any) => ({
					user_id: g.user_id,
					score: g.score,
					max_score: g.max_score,
					weight: g.weight,
					assessment: g.assessment_submission_id || g.assignment_submission_id || null,
					graded_at: g.graded_at,
				})),
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// POST /api/aiedu/analyze-gradebook — manual grade analysis (existing)
// Body: { students, assignments, scores, subject, grade, curriculum_id }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const body = await request.json();
		const { students, assignments, scores, subject, grade, curriculum_id } = body;
		if (!students?.length || !assignments?.length) {
			return jsonResponse({ success: false, error: 'students and assignments required' }, 400);
		}

		const analyzedStudents = students.map((name: string, i: number) => ({
			name,
			scores: (assignments || []).map((_: any, j: number) => {
				const s = scores?.[j]?.[i];
				return { pct: s !== null && s !== undefined ? Number(s) : null, score: s, max: 100 };
			}),
		}));

		const db = getDB(platform);

		const curriculumContext = curriculum_id ? `Kurikulum ID: ${curriculum_id}` : '';

		let insight = '';
		try {
			const gradeData = {
				students: analyzedStudents.map((s) => s.name),
				scores: analyzedStudents.map((s) => s.scores.map((x: any) => x.pct)),
			} as any;
			const { analyzeGrades } = await import('$lib/server/aiedu');
			insight = await analyzeGrades(platform, subject || 'Umum', '', curriculumContext, gradeData);
		} catch (aiErr) {
			const msg = aiErr instanceof Error ? aiErr.message : 'AI analysis failed';
			return jsonResponse({ success: false, error: msg }, 502);
		}

		// Save to aiedu_analyses
		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_analyses (id, user_id, subject, grade, curriculum_id, students_json, assignments_json, scores_json, insight, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id, session.user.id, subject || '', grade || '', curriculum_id || null,
			JSON.stringify(students), JSON.stringify(assignments), JSON.stringify(scores || []), insight
		).run();

		return jsonResponse({ success: true, data: { id, insight } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { gradeEssay } from '$lib/server/aiedu';

// POST /api/instructor/grade-essay
// Body: { submission_id, question_id, answer, max_points, question_text?, rubric?, model_answer? }
// Uses AI to grade essay answer, returns { score, feedback }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { submission_id, question_id, answer, max_points, question_text, rubric, model_answer } = body;

		if (!submission_id || !question_id) {
			return jsonResponse({ success: false, error: 'submission_id dan question_id wajib' }, 400);
		}
		if (answer === undefined || answer === null) {
			return jsonResponse({ success: false, error: 'answer wajib' }, 400);
		}
		const maxPoints = Number(max_points) || 1;

		// Verify instructor owns this submission's offering
		const submission = await db.prepare(`
			SELECT asub.*, a.course_offering_id, a.title AS assessment_title
			FROM assessment_submissions asub
			JOIN assessments a ON a.id = asub.assessment_id
			WHERE asub.id = ?
		`).bind(submission_id).first<any>();

		if (!submission) return jsonResponse({ success: false, error: 'Submission tidak ditemukan' }, 404);

		const offering = await db.prepare(
			'SELECT instructor_id FROM course_offerings WHERE id = ?'
		).bind(submission.course_offering_id).first<any>();

		if (!offering || offering.instructor_id !== session.user.id) {
			// Allow admins too
			if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
				return jsonResponse({ success: false, error: 'Forbidden' }, 403);
			}
		}

		// Resolve question text if not provided
		let question = question_text || '';
		let modelAnswer = model_answer || null;
		if (!question) {
			const q = await db.prepare(
				'SELECT question, correct_answer, explanation FROM question_bank WHERE id = ?'
			).bind(question_id).first<any>();
			if (q) {
				question = q.question || '';
				modelAnswer = q.correct_answer || null;
			}
		}

		// Call AI
		const result = await gradeEssay(platform, question, answer, maxPoints, rubric, modelAnswer);

		return jsonResponse({
			success: true,
			data: {
				score: result.score,
				max_score: maxPoints,
				feedback: result.feedback,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ params, request, platform }: {
	params: { offeringId: string; sessionId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const { offeringId, sessionId } = params;

		// Load session
		const tryoutSession = await db.prepare(
			'SELECT * FROM tryout_sessions WHERE id = ? AND user_id = ? AND course_offering_id = ?'
		).bind(sessionId, userId, offeringId).first<any>();
		if (!tryoutSession) return jsonResponse({ success: false, error: 'Session not found' }, 404);

		// Load answers
		const { results: answers } = await db.prepare(
			'SELECT * FROM tryout_answers WHERE session_id = ? ORDER BY answered_at ASC'
		).bind(sessionId).all<any>();

		// Parse stored questions
		let questions: any[] = [];
		try { questions = JSON.parse(tryoutSession.questions_json || '[]'); } catch {}

		// Re-fetch correct answers for DB questions
		const dbQuestionIds = questions.filter((q: any) => !q.generated).map((q: any) => q.id);
		const correctAnswers: Record<string, string> = {};
		const explanations: Record<string, string> = {};

		if (dbQuestionIds.length > 0) {
			const placeholders = dbQuestionIds.map(() => '?').join(',');
			const { results: dbQuestions } = await db.prepare(
				`SELECT id, correct_answer, explanation FROM question_bank WHERE id IN (${placeholders})`
			).bind(...dbQuestionIds).all<any>();
			for (const q of dbQuestions || []) {
				correctAnswers[q.id] = (q.correct_answer || '').trim();
				explanations[q.id] = q.explanation || '';
			}
		}

		// Merge answers with questions
		const answersByQId: Record<string, any> = {};
		for (const a of answers || []) {
			answersByQId[a.question_id] = a;
		}

		const results = questions.map((q: any) => {
			const ca = correctAnswers[q.id] || '';
			const exp = explanations[q.id] || '';
			const userAns = answersByQId[q.id]?.selected_answer || '';
			const correct = userAns !== '' && userAns === ca.toUpperCase();
			return {
				questionId: q.id,
				question: q.question,
				options: q.options,
				userAnswer: userAns,
				correctAnswer: ca,
				correct,
				subtest: q.subtest,
				explanation: exp,
			};
		});

		return jsonResponse({
			success: true,
			data: {
				session: {
					id: tryoutSession.id,
					startedAt: tryoutSession.started_at,
					submittedAt: tryoutSession.submitted_at,
					status: tryoutSession.status,
					timeLimitMinutes: tryoutSession.time_limit_minutes,
				},
				scores: {
					total: tryoutSession.score_total,
					tps: tryoutSession.score_tps,
					literasi: tryoutSession.score_literasi,
					matematika: tryoutSession.score_matematika,
				},
				results,
				answersCount: tryoutSession.answers_count,
				totalQuestions: tryoutSession.total_questions,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

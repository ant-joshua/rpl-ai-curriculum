import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export async function load({ params, request, platform, url }: {
	params: Record<string, string>;
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, `/login?redirect=/tryout/${params.offeringId}/results`);

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, `/login?redirect=/tryout/${params.offeringId}/results`);

	const db = getDB(platform);
	const userId = session.user.id;
	const offeringId = params.offeringId;

	// Load offering
	const offering = await db.prepare(
		'SELECT co.*, c.title as course_title FROM course_offerings co LEFT JOIN courses c ON c.id = co.course_id WHERE co.id = ?'
	).bind(offeringId).first<any>();
	if (!offering) throw redirect(302, '/catalog');

	// Find the most recent non-active session
	const lastSession = await db.prepare(
		`SELECT * FROM tryout_sessions
		 WHERE user_id = ? AND course_offering_id = ? AND status != 'active'
		 ORDER BY created_at DESC LIMIT 1`
	).bind(userId, offeringId).first<any>();

	if (!lastSession) {
		return { offering, session: null, scores: null, results: [], answersCount: 0, totalQuestions: 0 };
	}

	// Load answers
	const { results: answers } = await db.prepare(
		'SELECT * FROM tryout_answers WHERE session_id = ? ORDER BY answered_at ASC'
	).bind(lastSession.id).all<any>();

	// Parse stored questions
	let questions: any[] = [];
	try { questions = JSON.parse(lastSession.questions_json || '[]'); } catch {}

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

	const answersByQId: Record<string, any> = {};
	for (const a of answers || []) answersByQId[a.question_id] = a;

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
			subtest: q.subtest || 'tps',
			explanation: exp,
		};
	});

	return {
		offering,
		session: lastSession,
		scores: {
			total: lastSession.score_total,
			tps: lastSession.score_tps,
			literasi: lastSession.score_literasi,
			matematika: lastSession.score_matematika,
		},
		results,
		answersCount: lastSession.answers_count,
		totalQuestions: lastSession.total_questions,
		token,
	};
}

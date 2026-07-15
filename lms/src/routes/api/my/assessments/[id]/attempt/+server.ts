import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);

		// Fetch assessment
		const assessment = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.id).first<any>();
		if (!assessment) return jsonResponse({ success: false, error: 'Assessment not found' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(session.user.id, assessment.course_offering_id, 'active').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Not enrolled in this course' }, 403);

		// Fetch linked questions
		const { results: questionLinks } = await db.prepare(
			`SELECT aq.*, qb.type, qb.question, qb.options, qb.code_template, qb.test_cases,
			        qb.explanation, qb.difficulty, qb.tags
			 FROM assessment_questions aq
			 JOIN question_bank qb ON qb.id = aq.question_id
			 WHERE aq.assessment_id = ?
			 ORDER BY aq.order_index ASC`
		).bind(params.id).all<any>();

		let questions = (questionLinks || []).map((q: any) => {
			let options: any[] = [];
			try { options = JSON.parse(q.options || '[]'); } catch {}

			return {
				id: q.question_id,
				type: q.type,
				question: q.question,
				options, // only option texts, no correct flag
				code_template: q.code_template,
				points: q.points,
				order_index: q.order_index,
			};
		});

		// Shuffle if enabled
		if (assessment.shuffle_questions) {
			questions = questions.sort(() => Math.random() - 0.5);
		}

		// Check existing submissions for attempt tracking
		const { results: existingSubs } = await db.prepare(
			'SELECT id, status, score, started_at FROM assessment_submissions WHERE assessment_id = ? AND user_id = ? ORDER BY created_at DESC'
		).bind(params.id, session.user.id).all<any>();

		const attemptsUsed = (existingSubs || []).filter((s: any) => s.status !== 'draft').length;
		const attemptsRemaining = assessment.max_attempts - attemptsUsed;

		// --- Timer persistence: find or create a draft submission with started_at ---
		let draftSub = (existingSubs || []).find((s: any) => s.status === 'draft');
		let startedAt: string | null = null;

		if (assessment.time_limit_minutes && attemptsRemaining > 0) {
			if (draftSub) {
				// Resume existing draft — keep original started_at
				startedAt = draftSub.started_at || new Date().toISOString();
			} else {
				// Create a new draft submission to lock in start time
				const subId = crypto.randomUUID();
				const now = new Date().toISOString();
				startedAt = now;
				await db.prepare(
					`INSERT INTO assessment_submissions (id, assessment_id, user_id, status, started_at, created_at, updated_at)
					 VALUES (?, ?, ?, 'draft', ?, ?, ?)`
				).bind(subId, params.id, session.user.id, startedAt, now, now).run();
				draftSub = { id: subId };
			}
		}

		return jsonResponse({
			success: true,
			data: {
				assessment,
				questions,
				attemptsUsed,
				attemptsRemaining,
				draftSubmissionId: draftSub?.id || null,
				startedAt, // ISO string for accurate client-side countdown
				previousAttempts: (existingSubs || []).map((s: any) => ({
					id: s.id,
					status: s.status,
					score: s.score,
				})),
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);

		// Fetch assessment
		const assessment = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.id).first<any>();
		if (!assessment) return jsonResponse({ success: false, error: 'Assessment not found' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(session.user.id, assessment.course_offering_id, 'active').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Not enrolled' }, 403);

		// Check max attempts
		const { results: existingSubs } = await db.prepare(
			'SELECT id FROM assessment_submissions WHERE assessment_id = ? AND user_id = ? AND status = ?'
		).bind(params.id, session.user.id, 'submitted').all<any>();
		if ((existingSubs || []).length >= assessment.max_attempts) {
			return jsonResponse({ success: false, error: 'Maximum attempts reached' }, 403);
		}

		const body = await request.json();
		const answers: Array<{ questionId: string; answer: string }> = body.answers || [];
		const timeSpent: number = body.timeSpent || 0;

		// --- Server-side time limit enforcement ---
		// Find the draft submission (or any submission's started_at)
		const { results: allSubs } = await db.prepare(
			'SELECT id, started_at FROM assessment_submissions WHERE assessment_id = ? AND user_id = ? ORDER BY created_at DESC'
		).bind(params.id, session.user.id).all<any>();

		const draftSub = (allSubs || []).find((s: any) => s.started_at != null);
		let timeExpiredOnServer = false;

		if (assessment.time_limit_minutes && draftSub?.started_at) {
			const startedAtMs = new Date(draftSub.started_at + 'Z').getTime();
			const nowMs = Date.now();
			const elapsedSecs = (nowMs - startedAtMs) / 1000;
			const limitSecs = assessment.time_limit_minutes * 60;
			// Allow a 30-second grace period for network/sync delays
			if (elapsedSecs > limitSecs + 30) {
				timeExpiredOnServer = true;
			}
		}

		// Fetch correct answers from pivot
		const { results: questionKeys } = await db.prepare(
			`SELECT aq.question_id, aq.points, aq.correct_answer, qb.type, qb.options, qb.explanation
			 FROM assessment_questions aq
			 JOIN question_bank qb ON qb.id = aq.question_id
			 WHERE aq.assessment_id = ?`
		).bind(params.id).all<any>();

		if (!questionKeys || questionKeys.length === 0) {
			return jsonResponse({ success: false, error: 'No questions linked to this assessment' }, 400);
		}

		// Grade answers
		let totalScore = 0;
		let maxScore = 0;
		const results: Array<{
			questionId: string;
			correct: boolean;
			userAnswer: string;
			correctAnswer: string;
			points: number;
			pointsAwarded: number;
			explanation: string | null;
		}> = [];

		for (const qk of questionKeys) {
			maxScore += qk.points;
			const userAns = answers.find(a => a.questionId === qk.question_id);
			const userAnswer = userAns?.answer?.trim() || '';
			const correctAnswer = (qk.correct_answer || '').trim();
			let correct = false;

			if (qk.type === 'multiple_choice' || qk.type === 'true_false') {
				correct = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
			} else if (qk.type === 'short_answer') {
				correct = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
			} else if (qk.type === 'essay') {
				correct = false;
			}

			const pointsAwarded = correct ? qk.points : 0;
			totalScore += pointsAwarded;

			results.push({
				questionId: qk.question_id,
				correct,
				userAnswer,
				correctAnswer: correctAnswer,
				points: qk.points,
				pointsAwarded,
				explanation: qk.explanation || null,
			});
		}

		const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
		const passed = percentage >= assessment.passing_score;

		// Save submission — use draft ID if exists, else create new
		const draftId = draftSub?.id || (allSubs || []).find(s => true)?.id;
		const submissionId = draftId || crypto.randomUUID();
		const now = new Date().toISOString();

		// Delete draft row if we're upgrading it via INSERT OR REPLACE
		await db.prepare(
			`INSERT INTO assessment_submissions (id, assessment_id, user_id, status, answers, score, max_score, started_at, submitted_at, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET
			   status = excluded.status,
			   answers = excluded.answers,
			   score = excluded.score,
			   max_score = excluded.max_score,
			   submitted_at = excluded.submitted_at,
			   updated_at = excluded.updated_at`
		).bind(
			submissionId,
			params.id,
			session.user.id,
			passed ? 'graded' : 'submitted',
			JSON.stringify(answers),
			totalScore,
			maxScore,
			draftSub?.started_at || null,
			now,
			now,
			now
		).run();

		// Update gradebook
		const gradeId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO gradebook (id, user_id, course_offering_id, assessment_submission_id, score, max_score, weight, graded_at, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			gradeId,
			session.user.id,
			assessment.course_offering_id,
			submissionId,
			totalScore,
			maxScore,
			assessment.weight,
			now,
			now,
			now
		).run();

		return jsonResponse({
			success: true,
			data: {
				submissionId,
				score: totalScore,
				maxScore,
				percentage,
				passed,
				passingScore: assessment.passing_score,
				results,
				showResults: assessment.show_results === 1,
				timeExpired: timeExpiredOnServer,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

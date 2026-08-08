import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

// POST /api/my/live-quiz/[id]/answer — { question_index, answer, response_time_ms }
export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const quiz = await db.prepare('SELECT * FROM live_quizzes WHERE id = ?').bind(params.id).first<any>();
		if (!quiz) return jsonResponse({ success: false, error: 'Quiz not found' }, 404);
		if (quiz.status !== 'running') return jsonResponse({ success: false, error: 'Quiz is not running' }, 400);

		const participant = await db.prepare(
			'SELECT id FROM live_quiz_participants WHERE quiz_id = ? AND user_id = ?'
		).bind(params.id, session.user.id).first<any>();
		if (!participant) return jsonResponse({ success: false, error: 'Not a participant' }, 403);

		const qids = JSON.parse(quiz.question_ids || '[]');
		const idx = quiz.current_index;
		if (idx < 0 || idx >= qids.length) return jsonResponse({ success: false, error: 'No active question' }, 400);

		const body = await request.json();
		const answer = body.answer ?? null;
		const responseTimeMs = Number(body.response_time_ms) || 0;

		// Check already answered
		const existing = await db.prepare(
			'SELECT id FROM live_quiz_responses WHERE quiz_id = ? AND user_id = ? AND question_index = ?'
		).bind(params.id, session.user.id, idx).first<any>();
		if (existing) return jsonResponse({ success: false, error: 'Already answered' }, 400);

		// Timed out?
		const times = JSON.parse(quiz.question_times || '[]');
		const limitMs = (times[idx] || 30) * 1000;
		const elapsed = quiz.question_started_at ? Date.now() - new Date(quiz.question_started_at).getTime() : 0;
		if (elapsed > limitMs + 3000) {
			return jsonResponse({ success: false, error: 'Time expired' }, 400);
		}

		// Load question + verify correctness
		const q = await db.prepare('SELECT * FROM question_bank WHERE id = ?').bind(qids[idx]).first<any>();
		if (!q) return jsonResponse({ success: false, error: 'Question not found' }, 404);

		let is_correct = 0;
		let points = 0;
		let correctAnswer: any = null;

		if (q.type === 'multiple_choice' || q.type === 'true_false') {
			// Convention: options array of strings, index 0 = correct answer
			// Student submits option INDEX (string) like assessments flow
			correctAnswer = '0';
			is_correct = String(answer) === correctAnswer ? 1 : 0;
			if (is_correct) points = q.points || 1;
		} else if (q.type === 'short_answer') {
			// first option = expected answer (if any)
			let options: any[] = [];
			try { options = JSON.parse(q.options || '[]'); } catch {}
			if (options.length > 0) {
				const expected = typeof options[0] === 'object' ? (options[0].text ?? options[0].value ?? options[0]) : options[0];
				correctAnswer = expected;
				is_correct = String(answer || '').trim().toLowerCase() === String(expected).trim().toLowerCase() ? 1 : 0;
				if (is_correct) points = q.points || 1;
			}
		}

		await db.prepare(
			`INSERT INTO live_quiz_responses (id, quiz_id, user_id, question_index, answer, is_correct, points, response_time_ms)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(crypto.randomUUID(), params.id, session.user.id, idx, answer === null ? null : JSON.stringify(answer), is_correct, points, responseTimeMs).run();

		// Update participant score
		await db.prepare(
			`UPDATE live_quiz_participants
			 SET score = score + ?, answered = answered + 1
			 WHERE id = ? AND quiz_id = ?`
		).bind(points, participant.id, params.id).run();

		const myScore = await db.prepare(
			'SELECT score FROM live_quiz_participants WHERE id = ?'
		).bind(participant.id).first<any>();

		return jsonResponse({
			success: true,
			is_correct,
			points,
			score: myScore?.score ?? 0,
		});
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to submit answer' }, 500);
	}
}
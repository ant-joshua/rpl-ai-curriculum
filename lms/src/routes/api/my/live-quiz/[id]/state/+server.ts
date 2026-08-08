import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

// GET /api/my/live-quiz/[id]/state — polling state: current question (no answers), timer, status
export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const quiz = await db.prepare('SELECT * FROM live_quizzes WHERE id = ?').bind(params.id).first<any>();
		if (!quiz) return jsonResponse({ success: false, error: 'Quiz not found' }, 404);

		// Must be participant
		const participant = await db.prepare(
			'SELECT * FROM live_quiz_participants WHERE quiz_id = ? AND user_id = ?'
		).bind(params.id, session.user.id).first<any>();
		if (!participant) return jsonResponse({ success: false, error: 'Not a participant' }, 403);

		const qids = JSON.parse(quiz.question_ids || '[]');
		const times = JSON.parse(quiz.question_times || '[]');
		const idx = quiz.current_index;

		let question: any = null;
		let myAnswer: any = null;
		let timeLeft = 0;

		if (quiz.status === 'running' && idx >= 0 && idx < qids.length) {
			const q = await db.prepare(
				'SELECT id, type, question, options, points FROM question_bank WHERE id = ?'
			).bind(qids[idx]).first<any>();
			if (q) {
				let options: any[] = [];
				try { options = JSON.parse(q.options || '[]'); } catch {}
				// strip correct flags for students
				question = {
					id: q.id,
					type: q.type,
					question: q.question,
					options: options.map((o: any) => (typeof o === 'object' ? o.text ?? o : o)),
					points: q.points || 1,
				};
			}
			// time left from question_started_at
			if (quiz.question_started_at) {
				const started = new Date(quiz.question_started_at).getTime();
				const elapsed = Date.now() - started;
				const limit = (times[idx] || 30) * 1000;
				timeLeft = Math.max(0, Math.round((limit - elapsed) / 1000));
			}
			// my previous answer for this question
			const resp = await db.prepare(
				'SELECT answer, is_correct FROM live_quiz_responses WHERE quiz_id = ? AND user_id = ? AND question_index = ?'
			).bind(params.id, session.user.id, idx).first<any>();
			if (resp) myAnswer = { answer: resp.answer, is_correct: resp.is_correct };
		}

		// Leaderboard (top 10)
		let leaderboard: any[] = [];
		if (quiz.status === 'finished' || quiz.status === 'running') {
			const { results } = await db.prepare(
				`SELECT p.user_id, p.score, p.answered, u.name
				 FROM live_quiz_participants p
				 JOIN users u ON u.id = p.user_id
				 WHERE p.quiz_id = ?
				 ORDER BY p.score DESC, p.answered ASC
				 LIMIT 10`
			).bind(params.id).all<any>();
			leaderboard = results || [];
		}

		// My total score
		let myScore = participant.score;
		let myAnswered = participant.answered;

		return jsonResponse({
			success: true,
			quiz: {
				id: quiz.id,
				title: quiz.title,
				status: quiz.status,
				current_index: idx,
				total_questions: qids.length,
				question_count: qids.length,
				time_left: timeLeft,
			},
			question,
			my_answer: myAnswer,
			leaderboard,
			my_score: myScore,
			my_answered: myAnswered,
		});
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to load state' }, 500);
	}
}
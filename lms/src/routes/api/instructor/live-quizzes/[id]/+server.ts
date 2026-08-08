import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

// GET  /api/instructor/live-quizzes/[id] — full quiz + questions + participants
// PATCH /api/instructor/live-quizzes/[id] — control: { action: 'start' | 'next' | 'finish' } or { status, question_times }
export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const quiz = await db.prepare('SELECT * FROM live_quizzes WHERE id = ?').bind(params.id).first<any>();
		if (!quiz) return jsonResponse({ success: false, error: 'Quiz not found' }, 404);

		// Verify creator
		if (quiz.created_by !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Not your quiz' }, 403);
		}

		const questionIds = JSON.parse(quiz.question_ids || '[]');
		const placeholders = questionIds.map(() => '?').join(',');
		let questions: any[] = [];
		if (questionIds.length > 0) {
			const { results } = await db.prepare(
				`SELECT id, type, question, options, points,
				        CASE WHEN type IN ('multiple_choice','true_false') THEN 1 ELSE 0 END AS has_correct_flag
				 FROM question_bank WHERE id IN (${placeholders})`
			).bind(...questionIds).all<any>();
			questions = (results || []).map((q: any) => {
				let options: any[] = [];
				try { options = JSON.parse(q.options || '[]'); } catch {}
				return { ...q, options };
			});
		}

		const { results: participants } = await db.prepare(
			`SELECT p.user_id, p.score, p.answered, p.joined_at, u.name, u.email
			 FROM live_quiz_participants p
			 JOIN users u ON u.id = p.user_id
			 WHERE p.quiz_id = ?
			 ORDER BY p.score DESC, p.answered ASC`
		).bind(params.id).all<any>();

		const { results: responses } = await db.prepare(
			`SELECT r.user_id, r.question_index, r.answer, r.is_correct, r.points, r.response_time_ms
			 FROM live_quiz_responses r
			 WHERE r.quiz_id = ?`
		).bind(params.id).all<any>();

		return jsonResponse({
			success: true,
			quiz: {
				...quiz,
				question_ids: questionIds,
				question_times: JSON.parse(quiz.question_times || '[]'),
			},
			questions,
			participants: participants || [],
			responses: responses || [],
		});
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to load quiz' }, 500);
	}
}

export async function PATCH({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const quiz = await db.prepare('SELECT * FROM live_quizzes WHERE id = ?').bind(params.id).first<any>();
		if (!quiz) return jsonResponse({ success: false, error: 'Quiz not found' }, 404);
		if (quiz.created_by !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Not your quiz' }, 403);
		}

		const body = await request.json();
		const { action, status } = body;
		const now = new Date().toISOString();

		if (status) {
			// Direct status set (finish/etc)
			await db.prepare('UPDATE live_quizzes SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, params.id).run();
			return jsonResponse({ success: true, status });
		}

		if (action === 'start') {
			await db.prepare(
				`UPDATE live_quizzes SET status = 'running', current_index = 0, question_started_at = ?, updated_at = ? WHERE id = ?`
			).bind(now, now, params.id).run();
			return jsonResponse({ success: true, current_index: 0 });
		}

		if (action === 'next') {
			const nextIndex = quiz.current_index + 1;
			const qids = JSON.parse(quiz.question_ids || '[]');
			if (nextIndex >= qids.length) {
				await db.prepare("UPDATE live_quizzes SET status = 'finished', updated_at = ? WHERE id = ?").bind(now, params.id).run();
				return jsonResponse({ success: true, status: 'finished' });
			}
			await db.prepare(
				`UPDATE live_quizzes SET current_index = ?, question_started_at = ?, updated_at = ? WHERE id = ?`
			).bind(nextIndex, now, now, params.id).run();
			return jsonResponse({ success: true, current_index: nextIndex });
		}

		if (action === 'finish') {
			await db.prepare("UPDATE live_quizzes SET status = 'finished', updated_at = ? WHERE id = ?").bind(now, params.id).run();
			return jsonResponse({ success: true, status: 'finished' });
		}

		return jsonResponse({ success: false, error: 'Unknown action' }, 400);
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to control quiz' }, 500);
	}
}
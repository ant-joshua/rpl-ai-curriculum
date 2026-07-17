import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const body = await request.json();
		const { question_id, answer } = body;

		if (!question_id || answer === undefined) {
			return jsonResponse({ success: false, error: 'question_id and answer required' }, 400);
		}

		const db = getDB(platform);
		const question = await db.prepare(
			'SELECT * FROM question_bank WHERE id = ? AND status = ?'
		).bind(question_id, 'published').first<any>();

		if (!question) {
			return jsonResponse({ success: false, error: 'Question not found' }, 404);
		}

		let correct = false;
		let explanation = question.explanation || '';

		if (question.type === 'multiple_choice') {
			let options: string[];
			try {
				options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
			} catch {
				options = [];
			}
			// First option is the correct answer
			const correctAnswer = options[0] || '';
			correct = String(answer).trim() === String(correctAnswer).trim();
			if (!explanation) {
				explanation = correct
					? 'Jawaban benar!'
					: `Jawaban salah. Jawaban yang benar: ${correctAnswer}`;
			}
		} else if (question.type === 'essay') {
			// Essay not auto-graded — just record answer
			correct = false;
			explanation = explanation || 'Jawaban essay akan diperiksa oleh pengajar.';
		} else if (question.type === 'coding') {
			// Coding not auto-graded — just record answer
			correct = false;
			explanation = explanation || 'Jawaban coding akan diperiksa oleh sistem.';
		}

		// Record attempt
		await db.prepare(
			`INSERT INTO practice_attempts (id, user_id, question_id, answer, correct, created_at)
			 VALUES (?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			crypto.randomUUID(),
			session.user.id,
			question_id,
			typeof answer === 'string' ? answer : JSON.stringify(answer),
			correct ? 1 : 0,
		).run();

		return jsonResponse({
			success: true,
			data: {
				correct,
				correct_answer: question.type === 'multiple_choice'
					? (() => { try { const o = JSON.parse(question.options); return o[0]; } catch { return undefined; } })()
					: undefined,
				explanation,
				points: question.points,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

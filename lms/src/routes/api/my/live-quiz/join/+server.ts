import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

// POST /api/my/live-quiz/join — { pin } → validate + enroll participant
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const body = await request.json();
		const pin = String(body.pin || '').trim();
		if (!/^\d{6}$/.test(pin)) return jsonResponse({ success: false, error: 'PIN harus 6 digit' }, 400);

		const db = getDB(platform);
		const quiz = await db.prepare(
			"SELECT * FROM live_quizzes WHERE pin = ? AND status != 'finished'"
		).bind(pin).first<any>();
		if (!quiz) return jsonResponse({ success: false, error: 'Quiz tidak ditemukan atau sudah selesai' }, 404);

		// Must be enrolled in the offering
		const enrollment = await db.prepare(
			"SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = 'active'"
		).bind(session.user.id, quiz.course_offering_id).first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Kamu belum terdaftar di kelas ini' }, 403);

		// Upsert participant
		const existing = await db.prepare(
			'SELECT id FROM live_quiz_participants WHERE quiz_id = ? AND user_id = ?'
		).bind(quiz.id, session.user.id).first<any>();

		if (existing) {
			await db.prepare('UPDATE live_quiz_participants SET joined_at = datetime(\'now\') WHERE id = ?').bind(existing.id).run();
		} else {
			await db.prepare(
				'INSERT INTO live_quiz_participants (id, quiz_id, user_id) VALUES (?, ?, ?)'
			).bind(crypto.randomUUID(), quiz.id, session.user.id).run();
		}

		return jsonResponse({
			success: true,
			quiz: {
				id: quiz.id,
				title: quiz.title,
				status: quiz.status,
				current_index: quiz.current_index,
				question_times: JSON.parse(quiz.question_times || '[]'),
			},
		});
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to join' }, 500);
	}
}
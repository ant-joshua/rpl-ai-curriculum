import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/courses/[offeringId]/questions/[questionId]/answers — list answers */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const parts = url.pathname.split('/');
		const questionId = parts[4];

		const { results } = await db.prepare(
			`SELECT a.id, a.body, a.is_best, a.created_at,
			        u.display_name AS author_name, u.avatar_url AS author_avatar, u.role
			 FROM course_answers a
			 LEFT JOIN users u ON u.id = a.user_id
			 WHERE a.question_id = ?
			 ORDER BY a.is_best DESC, a.created_at ASC`
		).bind(questionId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/courses/[offeringId]/questions/[questionId]/answers — add answer */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const parts = url.pathname.split('/');
		const questionId = parts[4];
		const userId = session.user.id;

		const body = await request.json();
		if (!body?.text) return jsonResponse({ success: false, error: 'Isi jawaban wajib' }, 400);

		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO course_answers (id, question_id, user_id, body) VALUES (?, ?, ?, ?)'
		).bind(id, questionId, userId, body.text).run();

		// Touch question for ordering
		await db.prepare(
			'UPDATE course_questions SET updated_at = datetime(\'now\') WHERE id = ?'
		).bind(questionId).run();

		// Notify question owner (unless they answered themselves)
		const question = await db.prepare(
			'SELECT q.user_id AS owner_id, q.title, q.course_offering_id, co.name AS offering_name FROM course_questions q LEFT JOIN course_offerings co ON co.id = q.course_offering_id WHERE q.id = ?'
		).bind(questionId).first<any>();
		if (question && question.owner_id !== userId) {
			const { NotificationRepository } = await import('$lib/repositories/notification.repository');
			const ownerTenant = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(question.owner_id).first<any>();
			await NotificationRepository.createNotification(platform, {
				tenant_id: ownerTenant?.tenant_id || 'default',
				user_id: question.owner_id,
				type: 'system',
				title: 'Pertanyaanmu dijawab 💬',
				body: `${session.user.display_name || 'Seseorang'} menjawab: "${question.title}" di ${question.offering_name || 'kursus'}`,
				reference_type: 'question',
				reference_id: questionId,
				channel: 'in_app',
				status: 'sent',
			});
		}

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

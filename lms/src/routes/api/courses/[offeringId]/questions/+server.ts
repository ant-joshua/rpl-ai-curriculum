import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/courses/[offeringId]/questions — list questions with answer counts */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.pathname.split('/')[3];

		const { results } = await db.prepare(
			`SELECT q.id, q.title, q.body, q.is_resolved, q.created_at,
			        u.display_name AS asker_name, u.avatar_url AS asker_avatar,
			        (SELECT COUNT(*) FROM course_answers a WHERE a.question_id = q.id) AS answer_count
			 FROM course_questions q
			 LEFT JOIN users u ON u.id = q.user_id
			 WHERE q.course_offering_id = ?
			 ORDER BY q.created_at DESC LIMIT 50`
		).bind(offeringId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/courses/[offeringId]/questions — ask a question (enrolled only) */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.pathname.split('/')[3];
		const userId = session.user.id;

		// Enrolled check
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Kamu harus terdaftar di kursus ini' }, 403);

		const body = await request.json();
		const { title, text } = body;
		if (!title || !text) return jsonResponse({ success: false, error: 'Judul dan isi pertanyaan wajib' }, 400);

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO course_questions (id, course_offering_id, user_id, title, body)
			 VALUES (?, ?, ?, ?, ?)`
		).bind(id, offeringId, userId, title, text).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

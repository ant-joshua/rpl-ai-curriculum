import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

function genPin(): string {
	return String(Math.floor(100000 + Math.random() * 900000));
}

// GET  /api/instructor/live-quizzes?offeringId=X — list quizzes
// POST /api/instructor/live-quizzes — create quiz from question_bank ids
export async function GET({ url, request, platform }: { url: URL; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const offeringId = url.searchParams.get('offeringId');

		let rows;
		if (offeringId) {
			const { results } = await db.prepare(
				`SELECT lq.*, 
				        (SELECT COUNT(*) FROM live_quiz_participants p WHERE p.quiz_id = lq.id) AS participant_count
				 FROM live_quizzes lq
				 WHERE lq.course_offering_id = ?
				 ORDER BY lq.created_at DESC`
			).bind(offeringId).all<any>();
			rows = results;
		} else {
			const { results } = await db.prepare(
				`SELECT lq.*, 
				        (SELECT COUNT(*) FROM live_quiz_participants p WHERE p.quiz_id = lq.id) AS participant_count
				 FROM live_quizzes lq
				 WHERE lq.created_by = ?
				 ORDER BY lq.created_at DESC`
			).bind(session.user.id).all<any>();
			rows = results;
		}

		return jsonResponse({ success: true, quizzes: rows || [] });
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to list quizzes' }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		if (session.user.role !== 'instructor' && session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Instructor only' }, 403);
		}

		const body = await request.json();
		const { course_offering_id, title, question_ids, question_times } = body;
		if (!course_offering_id || !title || !title.trim()) {
			return jsonResponse({ success: false, error: 'course_offering_id and title required' }, 400);
		}
		const qids: string[] = Array.isArray(question_ids) ? question_ids : [];
		if (qids.length === 0) return jsonResponse({ success: false, error: 'Select at least 1 question' }, 400);

		const db = getDB(platform);

		// Verify instructor owns (or is assigned to) the offering
		const offering = await db.prepare(
			'SELECT id FROM course_offerings WHERE id = ? AND (instructor_id = ? OR ? IN (?, ?))'
		).bind(course_offering_id, session.user.id, session.user.role, 'admin', 'superadmin').first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found or not yours' }, 403);

		// Validate question ids belong to offering
		const placeholders = qids.map(() => '?').join(',');
		const { results: validQs } = await db.prepare(
			`SELECT id, type FROM question_bank WHERE id IN (${placeholders}) AND course_offering_id = ?`
		).bind(...qids, course_offering_id).all<any>();
		if ((validQs || []).length !== qids.length) {
			return jsonResponse({ success: false, error: 'Some questions are invalid or not in this offering' }, 400);
		}

		// Times default 30s each
		const times = qids.map((_, i) => (Array.isArray(question_times) && question_times[i] ? Number(question_times[i]) : 30));

		const id = crypto.randomUUID();
		let pin = genPin();
		// Ensure unique pin
		let exists = await db.prepare('SELECT id FROM live_quizzes WHERE pin = ?').bind(pin).first<any>();
		while (exists) {
			pin = genPin();
			exists = await db.prepare('SELECT id FROM live_quizzes WHERE pin = ?').bind(pin).first<any>();
		}

		await db.prepare(
			`INSERT INTO live_quizzes (id, course_offering_id, created_by, title, pin, question_ids, question_times)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		).bind(id, course_offering_id, session.user.id, title.trim(), pin, JSON.stringify(qids), JSON.stringify(times)).run();

		return jsonResponse({ success: true, quiz: { id, pin, status: 'lobby' } }, 201);
	} catch (e: any) {
		return jsonResponse({ success: false, error: e?.message || 'Failed to create quiz' }, 500);
	}
}

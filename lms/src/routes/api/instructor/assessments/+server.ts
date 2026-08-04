import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// POST /api/instructor/assessments — create assessment from question bank questions
// Body: { course_offering_id, title, passing_score, time_limit_minutes, shuffle_questions, max_attempts, weight, due_date, status, question_ids: string[] }
// Creates assessment + assessment_questions links. Assigns to all active enrollments implicitly (enrollment-based access).
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);

		// Instructor-only (or admin)
		const role = session.user?.role || '';
		if (!['instructor', 'admin', 'superadmin'].includes(role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const {
			course_offering_id, title, passing_score, time_limit_minutes,
			shuffle_questions, max_attempts, weight, due_date, status,
			question_ids,
		} = body;

		if (!course_offering_id || !title?.trim()) {
			return jsonResponse({ success: false, error: 'course_offering_id and title required' }, 400);
		}
		if (!question_ids?.length) {
			return jsonResponse({ success: false, error: 'Pilih minimal 1 soal dari Question Bank' }, 400);
		}

		// Verify offering exists
		const offering = await db.prepare('SELECT id FROM course_offerings WHERE id = ?').bind(course_offering_id).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// Verify questions exist & get them
		const placeholders = question_ids.map(() => '?').join(',');
		const { results: qbQuestions } = await db.prepare(
			`SELECT id, type, points FROM question_bank WHERE id IN (${placeholders})`
		).bind(...question_ids).all<any>();

		if (!qbQuestions || qbQuestions.length === 0) {
			return jsonResponse({ success: false, error: 'Soal tidak ditemukan' }, 404);
		}

		const id = crypto.randomUUID();
		const stmts: any[] = [];

		stmts.push(db.prepare(
			`INSERT INTO assessments (id, course_offering_id, content_block_id, title, type, passing_score, time_limit_minutes,
			 shuffle_questions, show_results, max_attempts, weight, questions, due_date, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 'quiz', ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			course_offering_id,
			null,
			title.trim(),
			passing_score ?? 70,
			time_limit_minutes ?? null,
			shuffle_questions ?? 1,
			1,
			max_attempts ?? 1,
			weight ?? 0,
			JSON.stringify(qbQuestions.map((q: any) => ({ id: q.id, type: q.type, points: q.points || 1 }))),
			due_date ?? null,
			status ?? 'published'
		));

		// Link questions
		qbQuestions.forEach((q: any, i: number) => {
			stmts.push(db.prepare(
				`INSERT INTO assessment_questions (assessment_id, question_id, order_index, points)
				 VALUES (?, ?, ?, ?)`
			).bind(id, q.id, i, q.points || 1));
		});

		// Notify all active enrolled students
		const { results: enrollments } = await db.prepare(
			'SELECT user_id FROM enrollments WHERE course_offering_id = ? AND status = ?'
		).bind(course_offering_id, 'active').all<any>();
		// Get tenant for notifications (default tenant)
		const offeringRow = await db.prepare(
			'SELECT tenant_id FROM course_offerings WHERE id = ?'
		).bind(course_offering_id).first<any>();
		const tenantId = offeringRow?.tenant_id || 'default';
		for (const e of enrollments || []) {
			stmts.push(db.prepare(
				`INSERT INTO notifications (id, tenant_id, user_id, type, title, body, is_read, created_at)
				 VALUES (?, ?, ?, 'assessment', ?, ?, 0, datetime('now'))`
			).bind(crypto.randomUUID(), tenantId, e.user_id, `Quiz baru: ${title.trim()}`, 'Quiz siap dikerjakan di Assessment'));
		}

		await db.batch(stmts);

		return jsonResponse({ success: true, data: { id, question_count: qbQuestions.length } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// GET /api/instructor/assessments?course_offering_id=xxx — list assessments for offering
export async function GET({ request, platform, url }: { request: Request; platform: App.Platform; url: URL }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const role = session.user?.role || '';
		if (!['instructor', 'admin', 'superadmin'].includes(role)) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const offeringId = url.searchParams.get('course_offering_id');
		if (!offeringId) return jsonResponse({ success: false, error: 'course_offering_id required' }, 400);

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT a.*,
			        (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id) AS question_count,
			        (SELECT COUNT(*) FROM assessment_submissions s WHERE s.assessment_id = a.id AND s.status = 'graded') AS submissions_count
			 FROM assessments a
			 WHERE a.course_offering_id = ?
			 ORDER BY a.created_at DESC`
		).bind(offeringId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

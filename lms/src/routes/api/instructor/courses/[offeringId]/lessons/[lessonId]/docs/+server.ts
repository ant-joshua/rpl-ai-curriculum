import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

// GET/POST /api/instructor/courses/[offeringId]/lessons/[lessonId]/docs
// GET — list aiedu docs attached to this lesson
// POST — attach generated doc: { document_id }
export async function GET({ params, platform, locals }: { params: { offeringId: string; lessonId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const { results } = await db.prepare(
			`SELECT d.id, d.doc_type, d.subject, d.title, d.source, d.curriculum_id, c.name AS curriculum_name,
			        lc.id AS link_id, lc.order_index
			 FROM lesson_aiedu_docs lc
			 JOIN aiedu_documents d ON d.id = lc.document_id
			 LEFT JOIN curricula c ON c.id = d.curriculum_id
			 WHERE lc.lesson_id = ?
			 ORDER BY lc.order_index, lc.created_at`
		).bind(params.lessonId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, params, platform, locals }: { request: Request; params: { offeringId: string; lessonId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const lesson = await db.prepare(
			'SELECT * FROM lessons WHERE id = ? AND course_offering_id = ?'
		).bind(params.lessonId, params.offeringId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson not found' }, 404);

		const body = await request.json();
		const { document_id } = body;
		if (!document_id) return jsonResponse({ success: false, error: 'document_id required' }, 400);

		const doc = await db.prepare('SELECT * FROM aiedu_documents WHERE id = ?').bind(document_id).first<any>();
		if (!doc) return jsonResponse({ success: false, error: 'Document not found' }, 404);

		const existing = await db.prepare(
			'SELECT * FROM lesson_aiedu_docs WHERE lesson_id = ? AND document_id = ?'
		).bind(params.lessonId, document_id).first<any>();
		if (existing) return jsonResponse({ success: false, error: 'Document already attached' }, 409);

		const id = crypto.randomUUID();
		const order = await db.prepare(
			'SELECT COALESCE(MAX(order_index), 0) + 1 AS n FROM lesson_aiedu_docs WHERE lesson_id = ?'
		).bind(params.lessonId).first<any>();

		await db.prepare(
			'INSERT INTO lesson_aiedu_docs (id, lesson_id, document_id, order_index) VALUES (?, ?, ?, ?)'
		).bind(id, params.lessonId, document_id, order?.n || 1).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

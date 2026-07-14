import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { slug: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Get assessment by id or slug (id is primary, but slug could be id)
		const assessment = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.slug).first<any>();
		if (!assessment) return jsonResponse({ success: false, error: 'Assessment not found' }, 404);

		// Get linked questions with details
		const { results: linked } = await db.prepare(
			`SELECT aq.*, qb.type, qb.question, qb.options, qb.difficulty, qb.tags
			 FROM assessment_questions aq
			 JOIN question_bank qb ON qb.id = aq.question_id
			 WHERE aq.assessment_id = ?
			 ORDER BY aq.order_index ASC`
		).bind(params.slug).all<any>();

		// Get available questions from same course offering
		const { results: available } = await db.prepare(
			'SELECT id, type, question, difficulty, tags FROM question_bank WHERE course_offering_id = ? AND status = ? ORDER BY created_at DESC'
		).bind(assessment.course_offering_id, 'published').all<any>();

		return jsonResponse({
			success: true,
			data: {
				assessment,
				linkedQuestions: linked || [],
				availableQuestions: available || [],
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { slug: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { questionId, points, correctAnswer, orderIndex } = body;

		if (!questionId) {
			return jsonResponse({ success: false, error: 'questionId required' }, 400);
		}

		// Verify assessment exists
		const assessment = await db.prepare('SELECT id FROM assessments WHERE id = ?').bind(params.slug).first<any>();
		if (!assessment) return jsonResponse({ success: false, error: 'Assessment not found' }, 404);

		const qid = crypto.randomUUID();

		await db.prepare(
			`INSERT OR REPLACE INTO assessment_questions (assessment_id, question_id, order_index, points, correct_answer, created_at)
			 VALUES (?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			params.slug,
			questionId,
			orderIndex ?? 0,
			points ?? 1,
			correctAnswer ?? null,
		).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: { params: { slug: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { questionId } = body;

		if (!questionId) {
			return jsonResponse({ success: false, error: 'questionId required' }, 400);
		}

		await db.prepare(
			'DELETE FROM assessment_questions WHERE assessment_id = ? AND question_id = ?'
		).bind(params.slug, questionId).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

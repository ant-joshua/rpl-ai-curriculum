import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform, url }: { params: { offeringId: string }; platform: App.Platform; url: URL }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Get offering
		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(params.offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// Get enrollments with user info
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, u.display_name, u.email, u.username
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.role = 'student'
			 ORDER BY u.display_name ASC`
		).bind(params.offeringId).all<any>();

		// Get assessments for this offering
		const { results: assessments } = await db.prepare(
			'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get assignments for this offering
		const { results: assignments } = await db.prepare(
			'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get all grades for this offering
		const { results: grades } = await db.prepare(
			`SELECT g.*, asub.score AS as_score, asign.score AS asign_score
			 FROM gradebook g
			 LEFT JOIN assessment_submissions asub ON asub.id = g.assessment_submission_id
			 LEFT JOIN assignment_submissions asign ON asign.id = g.assignment_submission_id
			 WHERE g.course_offering_id = ?`
		).bind(params.offeringId).all<any>();

		return jsonResponse({
			success: true,
			data: {
				offering,
				enrollments: enrollments || [],
				assessments: assessments || [],
				assignments: assignments || [],
				grades: grades || []
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { offeringId: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();

		// Expect: { user_id, assessment_submission_id?, assignment_submission_id?, score, max_score, weight, feedback }
		const existing = body.id ? await db.prepare('SELECT * FROM gradebook WHERE id = ?').bind(body.id).first<any>() : null;

		if (existing) {
			await db.prepare(
				'UPDATE gradebook SET score = ?, max_score = ?, weight = ?, feedback = ?, graded_at = ?, updated_at = datetime(\'now\') WHERE id = ?'
			).bind(
				body.score ?? existing.score,
				body.max_score ?? existing.max_score,
				body.weight ?? existing.weight,
				body.feedback ?? existing.feedback,
				new Date().toISOString(),
				body.id
			).run();
			const updated = await db.prepare('SELECT * FROM gradebook WHERE id = ?').bind(body.id).first<any>();
			return jsonResponse({ success: true, data: updated });
		} else {
			const id = crypto.randomUUID();
			await db.prepare(
				`INSERT INTO gradebook (id, user_id, course_offering_id, assessment_submission_id, assignment_submission_id, score, max_score, weight, graded_by, graded_at, feedback, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
			).bind(
				id,
				body.user_id,
				params.offeringId,
				body.assessment_submission_id ?? null,
				body.assignment_submission_id ?? null,
				body.score ?? null,
				body.max_score ?? null,
				body.weight ?? 1.0,
				body.graded_by ?? null,
				new Date().toISOString(),
				body.feedback ?? null
			).run();
			const created = await db.prepare('SELECT * FROM gradebook WHERE id = ?').bind(id).first<any>();
			return jsonResponse({ success: true, data: created }, 201);
		}
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

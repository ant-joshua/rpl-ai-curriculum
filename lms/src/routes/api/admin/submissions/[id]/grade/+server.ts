import { getDB, jsonResponse } from '$lib/server/d1';

export async function POST({ request, params, platform }: {
	request: Request;
	params: { id: string };
	platform: App.Platform;
}): Promise<Response> {
	try {
		const body = await request.json();
		const { score, feedback } = body;

		if (score === undefined || score === null) {
			return jsonResponse({ success: false, error: 'Nilai (score) wajib diisi' }, 400);
		}

		const db = getDB(platform);
		const submission = await db.prepare(
			'SELECT asub.*, a.max_score, a.course_offering_id FROM assignment_submissions asub JOIN assignments a ON a.id = asub.assignment_id WHERE asub.id = ?'
		).bind(params.id).first<any>();

		if (!submission) {
			return jsonResponse({ success: false, error: 'Submission tidak ditemukan' }, 404);
		}

		const now = new Date().toISOString();

		await db.prepare(
			`UPDATE assignment_submissions
			 SET score = ?, feedback = ?, status = 'graded', graded_at = ?, graded_by = ?, updated_at = datetime('now')
			 WHERE id = ?`
		).bind(score, feedback || null, now, body.graded_by || null, params.id).run();

		// Sync to gradebook
		const gradeExisting = await db.prepare(
			'SELECT id FROM gradebook WHERE assignment_submission_id = ?'
		).bind(params.id).first<any>();

		if (gradeExisting) {
			await db.prepare(
				'UPDATE gradebook SET score = ?, max_score = ?, updated_at = ? WHERE assignment_submission_id = ?'
			).bind(score, submission.max_score, now, params.id).run();
		} else {
			await db.prepare(
				`INSERT INTO gradebook (id, user_id, course_offering_id, assignment_submission_id, score, max_score, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
			).bind(crypto.randomUUID(), submission.user_id, submission.course_offering_id, params.id, score, submission.max_score).run();
		}

		return jsonResponse({ success: true, data: { id: params.id, score, feedback, gradedAt: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

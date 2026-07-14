import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * PUT /api/instructor/courses/[offeringId]/submissions/[id]
 * Grade a student's assignment submission.
 */
export async function PUT({ request, params, platform, locals }: {
	request: Request;
	params: { offeringId: string; id: string };
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;

		// Verify instructor owns this offering
		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(params.offeringId).first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const existing = await db.prepare('SELECT * FROM assignment_submissions WHERE id = ?').bind(params.id).first<any>();
		if (!existing) {
			return jsonResponse({ success: false, error: 'Submission not found' }, 404);
		}

		const body = await request.json();

		await db.prepare(
			`UPDATE assignment_submissions
			 SET score = ?, feedback = ?, status = ?, graded_by = ?, graded_at = ?, updated_at = datetime('now')
			 WHERE id = ?`
		).bind(
			body.score ?? existing.score,
			body.feedback ?? existing.feedback,
			body.status ?? 'graded',
			user.id,
			new Date().toISOString(),
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM assignment_submissions WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

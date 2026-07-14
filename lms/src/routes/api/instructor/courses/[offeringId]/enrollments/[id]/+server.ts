import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * PUT /api/instructor/courses/[offeringId]/enrollments/[id]
 * Update a student enrollment (drop, complete, change status).
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

		// Verify instructor owns this course offering
		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(params.offeringId).first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const existing = await db.prepare('SELECT * FROM enrollments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) {
			return jsonResponse({ success: false, error: 'Enrollment not found' }, 404);
		}

		const body = await request.json();

		await db.prepare(
			'UPDATE enrollments SET status = ?, role = ?, final_grade = ?, final_score = ?, dropped_at = ?, completed_at = ? WHERE id = ?'
		).bind(
			body.status ?? existing.status,
			body.role ?? existing.role,
			body.final_grade ?? existing.final_grade,
			body.final_score ?? existing.final_score,
			body.status === 'dropped' ? (body.dropped_at ?? new Date().toISOString()) : existing.dropped_at,
			body.status === 'completed' ? (body.completed_at ?? new Date().toISOString()) : existing.completed_at,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM enrollments WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * DELETE /api/instructor/courses/[offeringId]/enrollments/[id]
 * Remove a student from a course (unenroll).
 */
export async function DELETE({ params, platform, locals }: {
	params: { offeringId: string; id: string };
	platform: App.Platform;
	locals: Record<string, any>;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;

		const offering = await db.prepare(
			'SELECT * FROM course_offerings WHERE id = ?'
		).bind(params.offeringId).first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		await db.prepare('DELETE FROM enrollments WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function POST({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const session = await db.prepare(
			'SELECT * FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!session) throw error(404, 'Session not found');
		if (session.status === 'completed') throw error(400, 'Session already completed');

		const body = await request.json();
		const { understanding_level, notes, next_session_plan, homework_given, homework_completed, topic_covered } = body;

		const now = new Date().toISOString();

		// Mark session as completed
		await db.prepare(
			'UPDATE tutoring_sessions SET status = ?, updated_at = ? WHERE id = ?'
		).bind('completed', now, params.id).run();

		// Deduct remaining sessions from the student's enrollment
		if (session.student_id) {
			// Find active batch_enrollment for this student
			const enrollment = await db.prepare(
				`SELECT be.* FROM batch_enrollments be
				 JOIN tutoring_sessions ts ON ts.id = ?
				 WHERE be.user_id = ? AND be.status = 'active'
				   AND (be.batch_id = ts.batch_id OR be.batch_id IS NULL)
				 ORDER BY be.enrollment_date DESC LIMIT 1`
			).bind(params.id, session.student_id).first<any>();

			if (enrollment && enrollment.remaining_sessions > 0) {
				await db.prepare(
					'UPDATE batch_enrollments SET remaining_sessions = remaining_sessions - 1 WHERE id = ?'
				).bind(enrollment.id).run();
			}
		}

		// Create progress record
		const progressId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO session_progress (id, tenant_id, session_id, student_id, topic_covered, understanding_level, notes, next_session_plan, homework_given, homework_completed, created_by, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			progressId, tenantId, params.id, session.student_id,
			topic_covered || null, understanding_level || null,
			notes || null, next_session_plan || null,
			homework_given || null, homework_completed ?? 0,
			locals.user.id, now
		).run();

		return json({ success: true, data: { id: progressId } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

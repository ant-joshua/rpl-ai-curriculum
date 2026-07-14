import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		// Fetch assignment
		const assignment = await db.prepare(
			`SELECT a.*, co.name AS offering_name, co.code AS offering_code,
			        c.title AS course_title, c.slug AS course_slug
			 FROM assignments a
			 JOIN course_offerings co ON co.id = a.course_offering_id
			 JOIN courses c ON c.id = co.course_id
			 WHERE a.id = ?`
		).bind(params.id).first<any>();

		if (!assignment) return jsonResponse({ success: false, error: 'Assignment not found' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id, status FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, assignment.course_offering_id).first<any>();

		if (!enrollment) {
			return jsonResponse({ success: false, error: 'Not enrolled in this course' }, 403);
		}

		// Check due date
		const now = new Date();
		const dueDate = assignment.due_date ? new Date(assignment.due_date + 'Z') : null;
		const isLate = dueDate && now > dueDate;
		const canSubmit = assignment.allow_late_submission === 1 || !isLate;

		// Fetch user's submission
		const submission = await db.prepare(
			'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ? ORDER BY created_at DESC'
		).bind(params.id, userId).first<any>();

		return jsonResponse({
			success: true,
			data: {
				assignment,
				enrollment: { status: enrollment.status },
				submission: submission || null,
				isLate,
				canSubmit,
				dueDate: dueDate?.toISOString() || null,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { id: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		// Fetch assignment
		const assignment = await db.prepare('SELECT * FROM assignments WHERE id = ?').bind(params.id).first<any>();
		if (!assignment) return jsonResponse({ success: false, error: 'Assignment not found' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status IN (?, ?)'
		).bind(userId, assignment.course_offering_id, 'active', 'completed').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Not enrolled' }, 403);

		// Check due date
		const now = new Date();
		const dueDate = assignment.due_date ? new Date(assignment.due_date + 'Z') : null;
		const isLate = dueDate && now > dueDate;
		if (isLate && assignment.allow_late_submission !== 1) {
			return jsonResponse({ success: false, error: 'Submission deadline has passed' }, 403);
		}

		const body = await request.json();
		const submissionText = body.submission_text || '';
		let fileUrls: string[] = body.file_urls || [];

		// Validate submission type
		if (assignment.submission_type === 'file' && fileUrls.length === 0) {
			return jsonResponse({ success: false, error: 'File submission required' }, 400);
		}
		if (assignment.submission_type === 'text' && !submissionText.trim()) {
			return jsonResponse({ success: false, error: 'Text submission required' }, 400);
		}
		if (assignment.submission_type === 'link' || assignment.submission_type === 'github') {
			if (!submissionText.trim()) {
				return jsonResponse({ success: false, error: 'URL submission required' }, 400);
			}
		}

		// Check existing submission — if exists and already submitted, reject
		const existing = await db.prepare(
			'SELECT * FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?'
		).bind(params.id, userId).first<any>();

		if (existing && existing.status === 'submitted') {
			return jsonResponse({ success: false, error: 'Already submitted. Contact instructor to resubmit.' }, 409);
		}

		const nowISO = new Date().toISOString();
		const submissionId = existing?.id || crypto.randomUUID();

		if (existing) {
			// Update existing (draft -> submitted)
			await db.prepare(
				`UPDATE assignment_submissions
				 SET status = 'submitted', submission_text = ?, file_urls = ?, submitted_at = ?, updated_at = datetime('now')
				 WHERE id = ?`
			).bind(
				submissionText,
				JSON.stringify(fileUrls),
				nowISO,
				existing.id
			).run();
		} else {
			// Create new submission
			await db.prepare(
				`INSERT INTO assignment_submissions (id, assignment_id, user_id, status, submission_text, file_urls, score, max_score, submitted_at, created_at, updated_at)
				 VALUES (?, ?, ?, 'submitted', ?, ?, NULL, ?, ?, datetime('now'), datetime('now'))`
			).bind(
				submissionId,
				params.id,
				userId,
				submissionText,
				JSON.stringify(fileUrls),
				assignment.max_score,
				nowISO
			).run();
		}

		// Insert/update gradebook entry
		const gradeEntry = await db.prepare(
			'SELECT * FROM gradebook WHERE user_id = ? AND course_offering_id = ? AND assignment_submission_id = ?'
		).bind(userId, assignment.course_offering_id, submissionId).first<any>();

		if (!gradeEntry) {
			await db.prepare(
				`INSERT INTO gradebook (id, user_id, course_offering_id, assignment_submission_id, max_score, weight, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
			).bind(
				crypto.randomUUID(),
				userId,
				assignment.course_offering_id,
				submissionId,
				assignment.max_score,
				assignment.weight
			).run();
		}

		return jsonResponse({ success: true, data: { id: submissionId, status: 'submitted' } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

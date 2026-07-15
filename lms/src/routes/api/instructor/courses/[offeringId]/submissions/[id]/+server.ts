import { getDB, jsonResponse } from '$lib/server/d1';

/** Fire-and-forget XP award — never blocks the main request */
async function fetchXpAward(db: any, userId: string, amount: number, reason: string, referenceType?: string, referenceId?: string) {
	try {
		const txId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(txId, userId, amount, reason, referenceType || null, referenceId || null).run();

		const existingXp = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
		if (existingXp) {
			const totalXp = existingXp.total_xp + amount;
			const level = Math.floor(totalXp / 100) + 1;
			await db.prepare(
				'UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime(\'now\') WHERE user_id = ?'
			).bind(totalXp, level, userId).run();
		} else {
			const level = Math.floor(amount / 100) + 1;
			await db.prepare(
				'INSERT INTO user_xp (id, user_id, total_xp, level, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
			).bind(crypto.randomUUID(), userId, amount, level).run();
		}
	} catch {
		// best-effort
	}
}

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

		// Award XP on grading (fire-and-forget)
		if (body.score !== undefined && body.score !== null) {
			const scorePct = body.score / (existing.max_score || 100);
			const xpAmount = scorePct >= 0.9 ? 50 : scorePct >= 0.7 ? 35 : 25;
			fetchXpAward(db, existing.user_id, xpAmount, 'assignment_graded', 'assignment', existing.assignment_id);
		}

		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

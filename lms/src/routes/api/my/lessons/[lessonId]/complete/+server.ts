import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function POST({ params, request, platform }: {
	params: { lessonId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const userId = session.user.id;
		const db = getDB(platform);

		// Get lesson info
		const lesson = await db.prepare(
			'SELECT id, course_offering_id, slug FROM lessons WHERE id = ?'
		).bind(params.lessonId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson tidak ditemukan' }, 404);

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ? AND status = ?'
		).bind(userId, lesson.course_offering_id, 'active').first<any>();
		if (!enrollment) return jsonResponse({ success: false, error: 'Tidak terdaftar di kursus ini' }, 403);

		const body = await request.json().catch(() => ({}));
		const timeSpent = body.time_spent_seconds || 0;

		// Upsert lesson_completion
		const existing = await db.prepare(
			'SELECT id FROM lesson_completions WHERE user_id = ? AND lesson_id = ?'
		).bind(userId, params.lessonId).first<any>();

		const now = new Date().toISOString();

		if (existing) {
			await db.prepare(
				'UPDATE lesson_completions SET completed_at = ?, time_spent_seconds = ? WHERE id = ?'
			).bind(now, timeSpent, existing.id).run();
		} else {
			const id = crypto.randomUUID();
			await db.prepare(
				'INSERT INTO lesson_completions (id, user_id, lesson_id, course_offering_id, completed_at, time_spent_seconds) VALUES (?, ?, ?, ?, ?, ?)'
			).bind(id, userId, params.lessonId, lesson.course_offering_id, now, timeSpent).run();
		}

		// Also sync to progress table for backward compat
		const progressId = `progress-${userId}-${lesson.course_offering_id}-${lesson.slug}`;
		await db.prepare(
			`INSERT INTO progress (id, user_id, module_slug, session_id, completed, completed_at, time_spent, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
			 ON CONFLICT(user_id, module_slug, session_id)
			 DO UPDATE SET completed = 1, completed_at = ?, time_spent = ?, updated_at = ?`
		).bind(
			progressId, userId, lesson.course_offering_id, lesson.slug,
			now, timeSpent, now, now,
			now, timeSpent, now
		).run();

		// Log activity
		await db.prepare(
			`INSERT INTO user_activity_log (id, user_id, action, entity_type, entity_id, metadata, created_at)
			 VALUES (?, ?, 'complete_lesson', 'lesson', ?, ?, ?)`
		).bind(crypto.randomUUID(), userId, params.lessonId, JSON.stringify({ title: lesson.title, offeringId: lesson.course_offering_id }), now).run();

		return jsonResponse({ success: true, data: { completedAt: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, request, platform }: {
	params: { lessonId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const userId = session.user.id;
		const db = getDB(platform);

		const lesson = await db.prepare('SELECT id, slug, course_offering_id FROM lessons WHERE id = ?').bind(params.lessonId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson tidak ditemukan' }, 404);

		await db.prepare(
			'DELETE FROM lesson_completions WHERE user_id = ? AND lesson_id = ?'
		).bind(userId, params.lessonId).run();

		// Also sync progress table
		await db.prepare(
			`UPDATE progress SET completed = 0, completed_at = NULL, updated_at = ?
			 WHERE user_id = ? AND module_slug = ? AND session_id = ?`
		).bind(new Date().toISOString(), userId, lesson.course_offering_id, lesson.slug).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function GET({ params, request, platform }: {
	params: { lessonId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const userId = session.user.id;
		const db = getDB(platform);

		const completion = await db.prepare(
			'SELECT * FROM lesson_completions WHERE user_id = ? AND lesson_id = ?'
		).bind(userId, params.lessonId).first<any>();

		return jsonResponse({
			success: true,
			data: {
				completed: !!completion,
				completedAt: completion?.completed_at || null,
				timeSpentSeconds: completion?.time_spent_seconds || 0,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

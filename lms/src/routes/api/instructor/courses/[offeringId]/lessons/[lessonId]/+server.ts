import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

// GET /api/instructor/courses/[offeringId]/lessons/[lessonId] — lesson detail with content
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

		const lesson = await db.prepare(
			'SELECT * FROM lessons WHERE id = ? AND course_offering_id = ?'
		).bind(params.lessonId, params.offeringId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson not found' }, 404);

		let content = '';
		if (lesson.content_block_id) {
			const block = await db.prepare('SELECT body FROM content_blocks WHERE id = ?').bind(lesson.content_block_id).first<any>();
			content = block?.body || '';
		}

		const { results: resources } = await db.prepare(
			'SELECT id, title, file_url, file_type FROM lesson_resources WHERE lesson_id = ? ORDER BY created_at DESC'
		).bind(lesson.id).all<any>();

		return jsonResponse({ success: true, data: { ...lesson, content, resources: resources || [] } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// PATCH /api/instructor/courses/[offeringId]/lessons/[lessonId] — update lesson
// Body: { title?, content?, duration_minutes?, is_optional?, status?, unlock_days? }
export async function PATCH({ request, params, platform, locals }: { request: Request; params: { offeringId: string; lessonId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const lesson = await db.prepare('SELECT * FROM lessons WHERE id = ? AND course_offering_id = ?').bind(params.lessonId, params.offeringId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson not found' }, 404);

		const body = await request.json();
		const { title, content, duration_minutes, is_optional, status, unlock_days } = body;

		if (title !== undefined && title !== null) {
			await db.prepare('UPDATE lessons SET title = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(title, lesson.id).run();
		}
		if (duration_minutes !== undefined) {
			await db.prepare('UPDATE lessons SET duration_minutes = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(Number(duration_minutes) || 0, lesson.id).run();
		}
		if (is_optional !== undefined) {
			await db.prepare('UPDATE lessons SET is_optional = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(is_optional ? 1 : 0, lesson.id).run();
		}
		if (status !== undefined) {
			await db.prepare('UPDATE lessons SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(status, lesson.id).run();
		}
		if (unlock_days !== undefined) {
			await db.prepare('UPDATE lessons SET unlock_days = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(unlock_days ?? null, lesson.id).run();
		}
		if (content !== undefined && lesson.content_block_id) {
			await db.prepare('UPDATE content_blocks SET body = ?, body_html = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(content, content, lesson.content_block_id).run();
		}

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// DELETE /api/instructor/courses/[offeringId]/lessons/[lessonId] — delete lesson
export async function DELETE({ params, platform, locals }: { params: { offeringId: string; lessonId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const lesson = await db.prepare('SELECT * FROM lessons WHERE id = ? AND course_offering_id = ?').bind(params.lessonId, params.offeringId).first<any>();
		if (!lesson) return jsonResponse({ success: false, error: 'Lesson not found' }, 404);

		if (lesson.content_block_id) {
			await db.prepare('DELETE FROM content_blocks WHERE id = ?').bind(lesson.content_block_id).run();
		}
		await db.prepare('DELETE FROM lessons WHERE id = ?').bind(lesson.id).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

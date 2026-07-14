import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * API for managing lesson_content_blocks (multi-block lesson links).
 *
 * POST  /api/admin/lesson-content-blocks  — Create link
 * DELETE /api/admin/lesson-content-blocks  — Remove link
 * GET   /api/admin/lesson-content-blocks?lessonId=X — List links for a lesson
 */

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const lessonId = url.searchParams.get('lessonId');

		if (!lessonId) {
			return jsonResponse({ success: false, error: 'lessonId query parameter required' }, 400);
		}

		const result = await db.prepare(
			`SELECT lcb.*, cb.type as content_type, cb.title as content_title
			 FROM lesson_content_blocks lcb
			 JOIN content_blocks cb ON cb.id = lcb.content_block_id
			 WHERE lcb.lesson_id = ?
			 ORDER BY lcb.order_index ASC`
		).bind(lessonId).all<any>();

		return jsonResponse({ success: true, data: result.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { lessonId, contentBlockId, orderIndex, typeOverride } = body;

		if (!lessonId || !contentBlockId) {
			return jsonResponse({ success: false, error: 'lessonId and contentBlockId required' }, 400);
		}

		// Verify lesson exists
		const lesson = await db.prepare('SELECT id FROM lessons WHERE id = ?').bind(lessonId).first();
		if (!lesson) {
			return jsonResponse({ success: false, error: 'Lesson not found' }, 404);
		}

		// Verify content block exists
		const cb = await db.prepare('SELECT id FROM content_blocks WHERE id = ?').bind(contentBlockId).first();
		if (!cb) {
			return jsonResponse({ success: false, error: 'Content block not found' }, 404);
		}

		// Check for duplicate
		const existing = await db.prepare(
			'SELECT id FROM lesson_content_blocks WHERE lesson_id = ? AND content_block_id = ?'
		).bind(lessonId, contentBlockId).first();
		if (existing) {
			return jsonResponse({ success: false, error: 'Content block already linked to this lesson' }, 409);
		}

		const id = crypto.randomUUID();
		const actualOrder = orderIndex ?? 0;

		await db.prepare(
			`INSERT INTO lesson_content_blocks (id, lesson_id, content_block_id, order_index, type_override, created_at)
			 VALUES (?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id,
			lessonId,
			contentBlockId,
			actualOrder,
			typeOverride || null
		).run();

		const row = await db.prepare('SELECT * FROM lesson_content_blocks WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { lessonId, contentBlockId, id } = body;

		if (id) {
			// Delete by link ID
			await db.prepare('DELETE FROM lesson_content_blocks WHERE id = ?').bind(id).run();
		} else if (lessonId && contentBlockId) {
			// Delete by lesson + content block
			await db.prepare(
				'DELETE FROM lesson_content_blocks WHERE lesson_id = ? AND content_block_id = ?'
			).bind(lessonId, contentBlockId).run();
		} else {
			return jsonResponse({ success: false, error: 'Provide id or (lessonId + contentBlockId)' }, 400);
		}

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

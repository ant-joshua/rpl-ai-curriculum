import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

// GET /api/instructor/courses/[offeringId]/lessons — lessons for builder (owner only)
export async function GET({ params, platform, locals }: { params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const { results } = await db.prepare(
			'SELECT * FROM lessons WHERE course_offering_id = ? ORDER BY order_index ASC'
		).bind(params.offeringId).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// POST /api/instructor/courses/[offeringId]/lessons — create lesson
// Body: { title, content?, duration_minutes?, is_optional?, unlock_days? }
export async function POST({ request, params, platform, locals }: { request: Request; params: { offeringId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const body = await request.json();
		const { title, content, duration_minutes, is_optional, unlock_days } = body;
		if (!title || !title.trim()) return jsonResponse({ success: false, error: 'Lesson title is required' }, 400);

		// Next order index
		const maxRow = await db.prepare(
			'SELECT MAX(order_index) AS mx FROM lessons WHERE course_offering_id = ?'
		).bind(params.offeringId).first<any>();
		const orderIndex = (Number(maxRow?.mx) || 0) + 1;

		const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || `lesson-${orderIndex}`;
		const id = crypto.randomUUID();

		// Content block for the lesson body
		const contentBlockId = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO content_blocks (id, type, title, body, body_html, order_index) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(contentBlockId, 'text', title, content || '', content || '', 1).run();

		await db.prepare(
			`INSERT INTO lessons (id, course_offering_id, content_block_id, title, slug, order_index, duration_minutes, is_optional, status, unlock_days)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`
		).bind(
			id, params.offeringId, contentBlockId, title, slug, orderIndex,
			Number(duration_minutes) || 0, is_optional ? 1 : 0, unlock_days || null
		).run();

		return jsonResponse({ success: true, data: { id, slug, order_index: orderIndex } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

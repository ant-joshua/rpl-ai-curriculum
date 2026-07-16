import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const courseOfferingId = url.searchParams.get('course_offering_id');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (courseOfferingId) { where += ' AND course_offering_id = ?'; params.push(courseOfferingId); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM lessons ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare(`SELECT * FROM lessons ${where} ORDER BY order_index ASC`).bind(...params).all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const sql = `SELECT * FROM lessons ${where} ORDER BY order_index ASC LIMIT ? OFFSET ?`;
		const result = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: result.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { course_offering_id, content_block_id, title, slug, duration_minutes, is_optional, status, unlock_days } = body;

		if (!course_offering_id || !title || !slug) {
			return jsonResponse({ success: false, error: 'course_offering_id, title, and slug are required' }, 400);
		}

		// Auto-set order_index = max + 1 if not provided
		let order_index = body.order_index;
		if (order_index === undefined || order_index === null) {
			const maxRow = await db.prepare(
				'SELECT MAX(order_index) as max_idx FROM lessons WHERE course_offering_id = ?'
			).bind(course_offering_id).first<any>();
			order_index = (maxRow?.max_idx ?? -1) + 1;
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO lessons (id, course_offering_id, content_block_id, title, slug, order_index, duration_minutes, is_optional, status, unlock_days, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			course_offering_id,
			content_block_id || null,
			title,
			slug,
			order_index,
			duration_minutes ?? null,
			is_optional ?? 0,
			status || 'draft',
			unlock_days ?? null,
			now,
			now
		).run();

		const row = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

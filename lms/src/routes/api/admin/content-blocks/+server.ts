import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const type = url.searchParams.get('type');
		const lessonId = url.searchParams.get('lessonId');

		if (lessonId) {
			const result = await db.prepare(
				`SELECT cb.*, lcb.order_index, lcb.type_override, lcb.id as lcb_id
				 FROM lesson_content_blocks lcb
				 JOIN content_blocks cb ON cb.id = lcb.content_block_id
				 WHERE lcb.lesson_id = ?
				 ORDER BY lcb.order_index ASC`
			).bind(lessonId).all();
			return jsonResponse({ success: true, data: result.results || [] });
		}

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (type) { where += ' AND type = ?'; params.push(type); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM content_blocks ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare(`SELECT * FROM content_blocks ${where} ORDER BY order_index ASC`).bind(...params).all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const result = await db.prepare(`SELECT * FROM content_blocks ${where} ORDER BY order_index ASC LIMIT ? OFFSET ?`).bind(...params, pag.limit, pag.offset).all();
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
		const { type, title, body: bodyText, body_html, meta, order_index } = body;

		if (!type) {
			return jsonResponse({ success: false, error: 'type is required' }, 400);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO content_blocks (id, type, title, body, body_html, meta, order_index, visibility, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`
		).bind(
			id,
			type,
			title || '',
			bodyText || '',
			body_html || '',
			meta || '{}',
			order_index ?? 0,
			now,
			now
		).run();

		const row = await db.prepare('SELECT * FROM content_blocks WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

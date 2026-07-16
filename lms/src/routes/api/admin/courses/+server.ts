import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams, buildSearchCondition } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		const searchCond = buildSearchCondition(pag.search, ['title', 'slug', 'category'], params);
		if (searchCond) where += ` AND (${searchCond})`;

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM courses ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM courses ${where} ORDER BY updated_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const sql = `SELECT * FROM courses ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
		const rows = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { title, slug } = body;
		if (!title || !slug) {
			return jsonResponse({ success: false, error: 'title and slug required' }, 400);
		}
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			'INSERT INTO courses (id, title, slug, description, short_description, icon, cover_image, category, level, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
		).bind(
			id, title, slug,
			body.description || '',
			body.short_description || '',
			body.icon || '',
			body.cover_image || '',
			body.category || '',
			body.level || '',
			body.created_by || null,
			now, now
		).run();
		return jsonResponse({ success: true, data: { id, slug } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

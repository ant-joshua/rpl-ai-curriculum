import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const type = url.searchParams.get('type');
		let query = 'SELECT * FROM content_blocks';
		const params: string[] = [];
		if (type) {
			query += ' WHERE type = ?';
			params.push(type);
		}
		query += ' ORDER BY order_index ASC';
		const stmt = db.prepare(query);
		for (const p of params) stmt.bind(p);
		const result = params.length > 0 ? await db.prepare(query).bind(...params).all() : await db.prepare(query).all();
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

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const rows = await db.prepare('SELECT * FROM courses ORDER BY updated_at DESC').all();
		return jsonResponse({ success: true, data: rows.results || [] });
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

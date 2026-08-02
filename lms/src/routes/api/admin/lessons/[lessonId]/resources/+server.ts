import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/admin/lessons/[lessonId]/resources — list resources */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const lessonId = url.pathname.split('/')[4];
		const { results } = await db.prepare(
			'SELECT id, title, file_url, file_type, file_size, created_at FROM lesson_resources WHERE lesson_id = ? ORDER BY created_at ASC'
		).bind(lessonId).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/admin/lessons/[lessonId]/resources — add resource */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const lessonId = url.pathname.split('/')[4];
		const body = await request.json();
		const { title, file_url, file_type = 'file', file_size } = body;

		if (!title) return jsonResponse({ success: false, error: 'title wajib' }, 400);

		await db.prepare(
			`INSERT INTO lesson_resources (id, lesson_id, title, file_url, file_type, file_size)
			 VALUES (?, ?, ?, ?, ?, ?)`
		).bind(crypto.randomUUID(), lessonId, title, file_url || null, file_type, file_size || null).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const rows = await db.prepare('SELECT * FROM admin_content WHERE type = ? ORDER BY updated_at DESC').bind('module').all();
		const modules = await Promise.all((rows.results || []).map(async (row: any) => {
			const data = JSON.parse(row.data || '{}');
			return { id: row.id, key: row.key, ...data, updated_at: row.updated_at, created_at: row.created_at };
		}));
		return jsonResponse({ success: true, data: modules });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { key, title, description, order, techs, difficulty, level, sessions } = body;
		if (!key || !title) {
			return jsonResponse({ success: false, error: 'key and title required' }, 400);
		}
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const data = JSON.stringify({
			title,
			description: description || '',
			order: order || 0,
			techs: techs || [],
			difficulty: difficulty || level || 'Beginner',
			sessions: sessions || [],
		});
		await db.prepare(
			'INSERT INTO admin_content (id, key, type, data) VALUES (?, ?, ?, ?)'
		).bind(id, key, 'module', data).run();
		return jsonResponse({ success: true, data: { id, key } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);

		const countResult = await db.prepare("SELECT COUNT(*) as total FROM admin_content WHERE type = 'module'").first<{ total: number }>();
		const total = countResult?.total || 0;

		const mapRows = (rows: any[]) => (rows || []).map((row: any) => {
			const data = JSON.parse(row.data || '{}');
			return { id: row.id, key: row.key, ...data, updated_at: row.updated_at, created_at: row.created_at };
		});

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare("SELECT * FROM admin_content WHERE type = 'module' ORDER BY updated_at DESC").all();
			return jsonResponse({ success: true, data: mapRows(rows.results), total });
		}

		const rows = await db.prepare("SELECT * FROM admin_content WHERE type = 'module' ORDER BY updated_at DESC LIMIT ? OFFSET ?").bind(pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: mapRows(rows.results), pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
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

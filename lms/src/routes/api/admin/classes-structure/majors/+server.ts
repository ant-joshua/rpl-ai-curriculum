import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const tenantId = url.searchParams.get('tenant_id');

		const params: unknown[] = [];
		let where = '';
		if (tenantId) { where = ' WHERE tenant_id = ?'; params.push(tenantId); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM majors${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM majors${where} ORDER BY created_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const rows = await db.prepare(`SELECT * FROM majors${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { name, code, type } = body;

		if (!name) {
			return jsonResponse({ success: false, error: 'name is required' }, 400);
		}

		const db = getDB(platform);
		const id = crypto.randomUUID();

		await db.prepare(
			'INSERT INTO majors (id, tenant_id, name, code, type) VALUES (?, ?, ?, ?, ?)'
		).bind(id, body.tenant_id || null, name, code || null, type || 'umum').run();

		const row = await db.prepare('SELECT * FROM majors WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

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

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM school_levels${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM school_levels${where} ORDER BY created_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const rows = await db.prepare(`SELECT * FROM school_levels${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { name, slug, education_level } = body;

		if (!name || !slug) {
			return jsonResponse({ success: false, error: 'name and slug are required' }, 400);
		}

		const db = getDB(platform);
		const id = crypto.randomUUID();

		await db.prepare(
			'INSERT INTO school_levels (id, tenant_id, name, slug, education_level) VALUES (?, ?, ?, ?, ?)'
		).bind(id, body.tenant_id || null, name, slug, education_level || 'menengah').run();

		const row = await db.prepare('SELECT * FROM school_levels WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

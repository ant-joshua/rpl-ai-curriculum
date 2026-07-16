import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = url.searchParams.get('tenant_id');

		let query = 'SELECT * FROM school_levels';
		const params: string[] = [];
		if (tenantId) {
			query += ' WHERE tenant_id = ?';
			params.push(tenantId);
		}
		query += ' ORDER BY created_at DESC';

		const rows = params.length > 0
			? await db.prepare(query).bind(...params).all()
			: await db.prepare(query).all();

		return jsonResponse({ success: true, data: rows.results || [] });
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

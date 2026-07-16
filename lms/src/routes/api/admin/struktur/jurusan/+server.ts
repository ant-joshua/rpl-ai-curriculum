import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = url.searchParams.get('tenant_id');

		let query = 'SELECT * FROM majors';
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

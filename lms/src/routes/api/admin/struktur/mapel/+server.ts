import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const gradeLevelId = url.searchParams.get('grade_level_id');
		const majorId = url.searchParams.get('major_id');

		let query = 'SELECT * FROM subjects WHERE tenant_id = ?';
		const params: any[] = [tenantId];

		if (gradeLevelId) {
			query += ' AND grade_level_id = ?';
			params.push(gradeLevelId);
		}
		if (majorId) {
			query += ' AND major_id = ?';
			params.push(majorId);
		}

		query += ' ORDER BY name ASC';

		const rows = await db.prepare(query).bind(...params).all();
		return jsonResponse({ success: true, data: rows.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const { name, code, curriculum, type, major_id, grade_level_id, group_name, description, min_hours_per_week } = body;

		if (!name || !name.trim()) {
			return jsonResponse({ success: false, error: 'Nama mata pelajaran wajib diisi' }, 400);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO subjects (id, tenant_id, name, code, curriculum, type, major_id, grade_level_id, group_name, description, min_hours_per_week, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			tenantId,
			name.trim(),
			code?.trim() || null,
			curriculum || 'k13',
			type || 'wajib',
			major_id || null,
			grade_level_id || null,
			group_name?.trim() || null,
			description?.trim() || null,
			min_hours_per_week != null ? Number(min_hours_per_week) : null,
			now
		).run();

		const subject = await db.prepare('SELECT * FROM subjects WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: subject }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

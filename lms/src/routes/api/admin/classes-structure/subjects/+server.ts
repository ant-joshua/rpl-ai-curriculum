import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams, buildSearchCondition } from '$lib/server/pagination';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const tenantId = locals.tenant?.id || 'default';
		const gradeLevelId = url.searchParams.get('grade_level_id');
		const majorId = url.searchParams.get('major_id');

		const params: unknown[] = [tenantId];
		let where = 'WHERE tenant_id = ?';
		if (gradeLevelId) { where += ' AND grade_level_id = ?'; params.push(gradeLevelId); }
		if (majorId) { where += ' AND major_id = ?'; params.push(majorId); }

		const searchCond = buildSearchCondition(pag.search, ['name', 'code'], params);
		if (searchCond) where += ` AND (${searchCond})`;

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM subjects ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM subjects ${where} ORDER BY name ASC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const rows = await db.prepare(`SELECT * FROM subjects ${where} ORDER BY name ASC LIMIT ? OFFSET ?`).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
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

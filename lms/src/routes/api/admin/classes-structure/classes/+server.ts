import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const tenantId = url.searchParams.get('tenant_id');

		const params: unknown[] = [];
		let where = '';
		if (tenantId) { where = ' WHERE c.tenant_id = ?'; params.push(tenantId); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM classes c${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const baseQuery = `
			SELECT
				c.*,
				gl.name AS grade_level_name,
				gl.sequence AS grade_level_sequence,
				m.name AS major_name,
				m.code AS major_code,
				u.display_name AS homeroom_teacher_name
			FROM classes c
			LEFT JOIN grade_levels gl ON gl.id = c.grade_level_id
			LEFT JOIN majors m ON m.id = c.major_id
			LEFT JOIN users u ON u.id = c.homeroom_teacher_id
			${where}
			ORDER BY c.created_at DESC
		`;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(baseQuery).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const query = `${baseQuery} LIMIT ? OFFSET ?`;
		const rows = await db.prepare(query).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { grade_level_id, major_id, name, code, homeroom_teacher_id, room, shift } = body;

		if (!grade_level_id || !name) {
			return jsonResponse({ success: false, error: 'grade_level_id and name are required' }, 400);
		}

		const db = getDB(platform);
		const id = crypto.randomUUID();

		await db.prepare(
			`INSERT INTO classes (id, tenant_id, grade_level_id, major_id, name, code, homeroom_teacher_id, room, shift)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			body.tenant_id || null,
			grade_level_id,
			major_id || null,
			name,
			code || null,
			homeroom_teacher_id || null,
			room || null,
			shift || 'pagi'
		).run();

		const row = await db.prepare(`
			SELECT
				c.*,
				gl.name AS grade_level_name,
				gl.sequence AS grade_level_sequence,
				m.name AS major_name,
				m.code AS major_code,
				u.display_name AS homeroom_teacher_name
			FROM classes c
			LEFT JOIN grade_levels gl ON gl.id = c.grade_level_id
			LEFT JOIN majors m ON m.id = c.major_id
			LEFT JOIN users u ON u.id = c.homeroom_teacher_id
			WHERE c.id = ?
		`).bind(id).first<any>();

		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

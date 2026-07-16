import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams, buildSearchCondition } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const offeringId = url.searchParams.get('course_offering_id');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (offeringId) { where += ' AND course_offering_id = ?'; params.push(offeringId); }

		const searchCond = buildSearchCondition(pag.search, ['enrolled_at', 'status'], params);
		if (searchCond) where += ` AND (${searchCond})`;

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM enrollments ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`SELECT * FROM enrollments ${where} ORDER BY enrolled_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const sql = `SELECT * FROM enrollments ${where} ORDER BY enrolled_at DESC LIMIT ? OFFSET ?`;
		const rows = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: rows.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { user_id, course_offering_id } = body;
		if (!user_id || !course_offering_id) {
			return jsonResponse({ success: false, error: 'user_id and course_offering_id required' }, 400);
		}
		const db = getDB(platform);

		// Check UNIQUE(user_id, course_offering_id) constraint upfront
		const existing = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(user_id, course_offering_id).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Enrollment already exists for this user and offering' }, 409);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			'INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(
			id, user_id, course_offering_id,
			body.role || 'student',
			body.status || 'active',
			now
		).run();
		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

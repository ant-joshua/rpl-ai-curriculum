import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams, buildSearchCondition } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const offeringId = url.searchParams.get('course_offering_id');

		const params: unknown[] = [];
		let where = 'WHERE 1=1';
		if (offeringId) { where += ' AND e.course_offering_id = ?'; params.push(offeringId); }

		// Search by user display_name or email
		const search = url.searchParams.get('search') || pag.search;
		if (search) {
			where += ' AND (u.display_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
			const like = `%${search}%`;
			params.push(like, like, like);
		}

		const countResult = await db.prepare(
			`SELECT COUNT(*) as total FROM enrollments e LEFT JOIN users u ON u.id = e.user_id ${where}`
		).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const baseSql = `SELECT e.*, u.display_name AS user_name, u.email AS user_email, u.username,
			co.name AS offering_name, co.code AS offering_code,
			(SELECT COUNT(*) FROM enrollments e2 WHERE e2.user_id = e.user_id) AS user_enrollment_count
		FROM enrollments e
		LEFT JOIN users u ON u.id = e.user_id
		LEFT JOIN course_offerings co ON co.id = e.course_offering_id
		${where}`;

		if (pag.page === 0 || pag.limit === 0) {
			const rows = await db.prepare(`${baseSql} ORDER BY e.enrolled_at DESC`).bind(...params).all();
			return jsonResponse({ success: true, data: rows.results || [], total });
		}

		const sql = `${baseSql} ORDER BY e.enrolled_at DESC LIMIT ? OFFSET ?`;
		const rows = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all();
		return jsonResponse({
			success: true,
			data: rows.results || [],
			pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) },
		});
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
			return jsonResponse({ success: false, error: 'user_id dan course_offering_id wajib diisi' }, 400);
		}
		const db = getDB(platform);

		// Check user exists
		const user = await db.prepare('SELECT id, display_name FROM users WHERE id = ?').bind(user_id).first<any>();
		if (!user) {
			return jsonResponse({ success: false, error: 'User tidak ditemukan' }, 404);
		}

		// Check offering exists
		const offering = await db.prepare('SELECT id, name FROM course_offerings WHERE id = ?').bind(course_offering_id).first<any>();
		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering tidak ditemukan' }, 404);
		}

		// Check UNIQUE(user_id, course_offering_id) constraint
		const existing = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(user_id, course_offering_id).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Siswa sudah terdaftar di offering ini' }, 409);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			'INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(id, user_id, course_offering_id, body.role || 'student', body.status || 'active', now).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const tenantId = locals.tenant?.id || 'default';

		const params: unknown[] = [tenantId];
		let where = 'WHERE cs.tenant_id = ?';

		const classId = url.searchParams.get('class_id');
		const subjectId = url.searchParams.get('subject_id');
		const teacherId = url.searchParams.get('teacher_id');

		if (classId) { where += ' AND cs.class_id = ?'; params.push(classId); }
		if (subjectId) { where += ' AND cs.subject_id = ?'; params.push(subjectId); }
		if (teacherId) { where += ' AND cs.teacher_id = ?'; params.push(teacherId); }

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM class_subjects cs ${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		const baseQuery = `
			SELECT
				cs.id, cs.class_id, cs.subject_id, cs.teacher_id,
				cs.total_hours_per_week, cs.semester, cs.status,
				cs.kd_list, cs.created_at,
				c.name AS class_name, c.code AS class_code,
				s.name AS subject_name, s.code AS subject_code,
				u.display_name AS teacher_name, u.email AS teacher_email
			FROM class_subjects cs
			LEFT JOIN classes c ON c.id = cs.class_id
			LEFT JOIN subjects s ON s.id = cs.subject_id
			LEFT JOIN users u ON u.id = cs.teacher_id
			${where}
			ORDER BY c.name ASC, s.name ASC
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

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const { class_id, subject_id, teacher_id, semester, total_hours_per_week, kd_list } = body;

		if (!class_id) {
			return jsonResponse({ success: false, error: 'class_id wajib diisi' }, 400);
		}
		if (!subject_id) {
			return jsonResponse({ success: false, error: 'subject_id wajib diisi' }, 400);
		}
		if (!teacher_id) {
			return jsonResponse({ success: false, error: 'teacher_id wajib diisi' }, 400);
		}
		if (semester == null) {
			return jsonResponse({ success: false, error: 'semester wajib diisi' }, 400);
		}

		// Verify class exists
		const cls = await db.prepare(
			'SELECT id FROM classes WHERE id = ? AND tenant_id = ?'
		).bind(class_id, tenantId).first<any>();
		if (!cls) {
			return jsonResponse({ success: false, error: 'Kelas tidak ditemukan' }, 404);
		}

		// Verify subject exists
		const subj = await db.prepare(
			'SELECT id FROM subjects WHERE id = ? AND tenant_id = ?'
		).bind(subject_id, tenantId).first<any>();
		if (!subj) {
			return jsonResponse({ success: false, error: 'Mata pelajaran tidak ditemukan' }, 404);
		}

		// Verify teacher exists
		const teacher = await db.prepare(
			'SELECT id FROM users WHERE id = ? AND role IN (?, ?)'
		).bind(teacher_id, 'admin', 'instructor').first<any>();
		if (!teacher) {
			return jsonResponse({ success: false, error: 'Guru tidak ditemukan atau role bukan instructor/admin' }, 404);
		}

		// Check for duplicate assignment (same class + subject + semester)
		const existing = await db.prepare(
			'SELECT id FROM class_subjects WHERE class_id = ? AND subject_id = ? AND semester = ? AND tenant_id = ?'
		).bind(class_id, subject_id, semester, tenantId).first<any>();

		if (existing) {
			return jsonResponse({
				success: false,
				error: 'Penugasan sudah ada untuk kelas, mata pelajaran, dan semester yang sama'
			}, 409);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO class_subjects (id, tenant_id, class_id, subject_id, teacher_id, total_hours_per_week, semester, status, kd_list, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			tenantId,
			class_id,
			subject_id,
			teacher_id,
			total_hours_per_week != null ? Number(total_hours_per_week) : null,
			Number(semester),
			'active',
			kd_list ? JSON.stringify(kd_list) : null,
			now
		).run();

		const assignment = await db.prepare(`
			SELECT
				cs.*,
				c.name AS class_name,
				s.name AS subject_name,
				u.display_name AS teacher_name
			FROM class_subjects cs
			LEFT JOIN classes c ON c.id = cs.class_id
			LEFT JOIN subjects s ON s.id = cs.subject_id
			LEFT JOIN users u ON u.id = cs.teacher_id
			WHERE cs.id = ?
		`).bind(id).first<any>();

		return jsonResponse({ success: true, data: assignment }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

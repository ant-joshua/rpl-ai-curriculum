import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { K13GradeRepository } from '$lib/repositories/k13-grade.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || user.role !== 'instructor') throw error(403, 'Unauthorized');

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const classSubjectId = url.searchParams.get('class_subject_id');
		const kdId = url.searchParams.get('kd_id');
		const type = url.searchParams.get('type');
		const semesterParam = url.searchParams.get('semester');

		if (!classSubjectId || !kdId || !semesterParam) {
			throw error(400, 'class_subject_id, kd_id, dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		// Get class_id from class_subject
		const cs = await db.prepare(
			'SELECT class_id FROM class_subjects WHERE id = ? AND tenant_id = ?'
		).bind(classSubjectId, tenantId).first<any>();

		if (!cs) throw error(404, 'Class subject tidak ditemukan');

		// Get students
		const students = await db.prepare(`
			SELECT cm.user_id, cm.nis, u.display_name, u.email
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			WHERE cm.class_id = ? AND cm.role = 'student'
			ORDER BY cm.nis
		`).bind(cs.class_id).all<any>();

		// Get existing skills scores
		let query = `
			SELECT sk.*, kd.code AS kd_code, kd.description AS kd_description
			FROM k13_skills sk
			LEFT JOIN kompetensi_dasar kd ON kd.id = sk.kompetensi_dasar_id
			WHERE sk.class_subject_id = ? AND sk.kompetensi_dasar_id = ? AND sk.semester = ? AND sk.tenant_id = ?
		`;
		const params: any[] = [classSubjectId, kdId, semester, tenantId];

		if (type) {
			query += ' AND sk.type = ?';
			params.push(type);
		}

		query += ' ORDER BY sk.user_id';

		const existingScores = await db.prepare(query).bind(...params).all<any>();

		const scoreMap: Record<string, any[]> = {};
		for (const row of (existingScores.results || [])) {
			if (!scoreMap[row.user_id]) scoreMap[row.user_id] = [];
			scoreMap[row.user_id].push(row);
		}

		const data = (students.results || []).map((s: any) => ({
			user_id: s.user_id,
			nis: s.nis,
			display_name: s.display_name,
			email: s.email,
			existing_scores: scoreMap[s.user_id] || []
		}));

		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || user.role !== 'instructor') throw error(403, 'Unauthorized');

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		const { class_subject_id, kd_id, semester, grades } = body;

		if (!class_subject_id || !kd_id || semester == null || !grades || !Array.isArray(grades)) {
			throw error(400, 'class_subject_id, kd_id, semester, dan grades wajib diisi');
		}

		const repo = new K13GradeRepository(db, tenantId);

		await repo.saveSkillsBatch(
			grades.map((g: any) => ({
				user_id: g.user_id,
				class_subject_id,
				kompetensi_dasar_id: kd_id,
				type: g.type || 'praktik',
				title: g.title,
				score: g.score,
				max_score: g.max_score ?? 100,
				remedial_score: g.remedial_score ?? null,
				semester,
				graded_by: user.id
			}))
		);

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

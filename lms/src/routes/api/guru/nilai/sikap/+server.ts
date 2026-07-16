import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { K13GradeRepository } from '$lib/repositories/k13-grade.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || user.role !== 'instructor') throw error(403, 'Unauthorized');

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const classId = url.searchParams.get('class_id');
		const semesterParam = url.searchParams.get('semester');

		if (!classId || !semesterParam) {
			throw error(400, 'class_id dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		// Get students
		const students = await db.prepare(`
			SELECT cm.user_id, cm.nis, u.display_name, u.email
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			WHERE cm.class_id = ? AND cm.role = 'student'
			ORDER BY cm.nis
		`).bind(classId).all<any>();

		// Get existing attitude scores
		const existingScores = await db.prepare(`
			SELECT * FROM k13_attitude
			WHERE class_id = ? AND semester = ? AND tenant_id = ?
			ORDER BY user_id, competence_type
		`).bind(classId, semester, tenantId).all<any>();

		// Build map: user_id → array of attitude scores
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
		const { class_id, semester, grades } = body;

		if (!class_id || semester == null || !grades || !Array.isArray(grades)) {
			throw error(400, 'class_id, semester, dan grades wajib diisi');
		}

		const repo = new K13GradeRepository(db, tenantId);

		await repo.saveAttitude(
			grades.map((g: any) => ({
				user_id: g.user_id,
				class_id,
				competence_type: g.competence_type,
				semester,
				predikat: g.predikat,
				deskripsi: g.deskripsi,
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

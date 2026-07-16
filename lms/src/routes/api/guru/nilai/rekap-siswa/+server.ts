import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { K13GradeRepository } from '$lib/repositories/k13-grade.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || user.role !== 'instructor') throw error(403, 'Unauthorized');

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const userId = url.searchParams.get('user_id');
		const classId = url.searchParams.get('class_id');
		const semesterParam = url.searchParams.get('semester');

		if (!userId || !classId || !semesterParam) {
			throw error(400, 'user_id, class_id, dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		const repo = new K13GradeRepository(db, tenantId);

		// Get student info
		const student = await db.prepare(`
			SELECT u.id, u.display_name, u.email, cm.nis, cm.nisn
			FROM users u
			LEFT JOIN class_members cm ON cm.user_id = u.id AND cm.class_id = ?
			WHERE u.id = ?
		`).bind(classId, userId).first<any>();

		if (!student) throw error(404, 'Siswa tidak ditemukan');

		// Get class info
		const classInfo = await db.prepare(`
			SELECT c.*, gl.name AS grade_level_name, m.name AS major_name
			FROM classes c
			LEFT JOIN grade_levels gl ON gl.id = c.grade_level_id
			LEFT JOIN majors m ON m.id = c.major_id
			WHERE c.id = ?
		`).bind(classId).first<any>();

		// Get grade summary for all subjects
		const subjects = await repo.getGradeSummary(userId, classId, semester);

		// Get attitude scores
		const attitude = await db.prepare(`
			SELECT * FROM k13_attitude
			WHERE user_id = ? AND class_id = ? AND semester = ? AND tenant_id = ?
			ORDER BY competence_type
		`).bind(userId, classId, semester, tenantId).all<any>();

		// Get extracurricular scores
		const extracurricular = await db.prepare(`
			SELECT * FROM k13_extracurricular
			WHERE user_id = ? AND class_id = ? AND semester = ? AND tenant_id = ?
			ORDER BY activity_name
		`).bind(userId, classId, semester, tenantId).all<any>();

		return json({
			success: true,
			data: {
				student: student ? {
					id: student.id,
					display_name: student.display_name,
					email: student.email,
					nis: student.nis,
					nisn: student.nisn
				} : null,
				class: classInfo ? {
					id: classInfo.id,
					name: classInfo.name,
					code: classInfo.code,
					grade_level_name: classInfo.grade_level_name,
					major_name: classInfo.major_name
				} : null,
				semester,
				subjects: subjects || [],
				attitude: attitude.results || [],
				extracurricular: extracurricular.results || []
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

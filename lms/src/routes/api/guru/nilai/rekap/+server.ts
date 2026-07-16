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
		const semesterParam = url.searchParams.get('semester');

		if (!classSubjectId || !semesterParam) {
			throw error(400, 'class_subject_id dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		const repo = new K13GradeRepository(db, tenantId);

		// Get class info for subject name
		const cs = await db.prepare(`
			SELECT cs.*, s.name AS subject_name, s.code AS subject_code, c.name AS class_name
			FROM class_subjects cs
			LEFT JOIN subjects s ON s.id = cs.subject_id
			LEFT JOIN classes c ON c.id = cs.class_id
			WHERE cs.id = ? AND cs.tenant_id = ?
		`).bind(classSubjectId, tenantId).first<any>();

		if (!cs) throw error(404, 'Class subject tidak ditemukan');

		const recap = await repo.getGradeRecap(classSubjectId, semester);

		return json({
			success: true,
			data: {
				class_subject: {
					id: cs.id,
					subject_id: cs.subject_id,
					subject_name: cs.subject_name,
					subject_code: cs.subject_code,
					class_name: cs.class_name,
					semester: cs.semester
				},
				students: recap
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

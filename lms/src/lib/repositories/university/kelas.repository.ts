import type { D1Database } from '@cloudflare/workers-types';
import { UniversityCoursesRepository, type CourseRow } from './courses.repository';

// ============================================================
// Kelas Kuliah — split from university.repository.ts
// ============================================================
export interface KelasKuliahRow {
	id: string;
	tenant_id: string;
	course_catalog_id: string;
	academic_semester_id: string;
	code: string;
	dosen_id: string;
	schedule_json: string | null;
	max_students: number | null;
	current_students: number;
	created_at: string | null;
}


export class UniversityKelasRepository extends UniversityCoursesRepository {
	async getKelasKuliah(opts: { courseCatalogId?: string; academicSemesterId?: string; dosenId?: string } = {}): Promise<any[]> {
		let q = `SELECT kk.*, cc.code AS course_code, cc.name AS course_name, cc.sks,
				u.display_name AS dosen_name, asm.name AS semester_name
			 FROM kelas_kuliah kk
			 JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			 LEFT JOIN users u ON u.id = kk.dosen_id
			 LEFT JOIN academic_semesters asm ON asm.id = kk.academic_semester_id
			 WHERE kk.tenant_id = ?`;
		const p: any[] = [this.tenantId];
		if (opts.courseCatalogId) { q += ' AND kk.course_catalog_id = ?'; p.push(opts.courseCatalogId); }
		if (opts.academicSemesterId) { q += ' AND kk.academic_semester_id = ?'; p.push(opts.academicSemesterId); }
		if (opts.dosenId) { q += ' AND kk.dosen_id = ?'; p.push(opts.dosenId); }
		q += ' ORDER BY kk.code';
		const rows = await this.db.prepare(q).bind(...p).all<any>();
		return rows.results || [];
	}

	async getKelasKuliahDetail(id: string): Promise<any | null> {
		return this.db.prepare(`
			SELECT kk.*, cc.code AS course_code, cc.name AS course_name, cc.sks,
				u.display_name AS dosen_name, asm.name AS semester_name,
				(SELECT COUNT(*) FROM krs_items ki JOIN krs k ON k.id = ki.krs_id WHERE ki.kelas_kuliah_id = kk.id AND ki.status = 'active' AND k.status = 'approved') AS enrolled_count
			FROM kelas_kuliah kk
			JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			LEFT JOIN users u ON u.id = kk.dosen_id
			LEFT JOIN academic_semesters asm ON asm.id = kk.academic_semester_id
			WHERE kk.id = ? AND kk.tenant_id = ?
		`).bind(id, this.tenantId).first<any>();
	}

	async createKelasKuliah(data: {
		course_catalog_id: string; academic_semester_id: string;
		code: string; dosen_id: string;
		schedule_json?: string; max_students?: number;
	}): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			`INSERT INTO kelas_kuliah (id, tenant_id, course_catalog_id, academic_semester_id, code, dosen_id, schedule_json, max_students, current_students)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`
		).bind(id, this.tenantId, data.course_catalog_id, data.academic_semester_id,
			data.code, data.dosen_id, data.schedule_json || null, data.max_students ?? null).run();
		return (await this.getKelasKuliahDetail(id))!;
	}

	async updateKelasKuliah(id: string, data: Record<string, any>): Promise<any | null> {
		const keys = ['course_catalog_id', 'academic_semester_id', 'code', 'dosen_id', 'schedule_json', 'max_students'];
		const sets: string[] = [];
		const params: any[] = [];
		for (const k of keys) {
			if (data[k] !== undefined) { sets.push(`${k} = ?`); params.push(data[k]); }
		}
		if (sets.length === 0) return this.getKelasKuliahDetail(id);
		params.push(id, this.tenantId);
		await this.db.prepare(`UPDATE kelas_kuliah SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return this.getKelasKuliahDetail(id);
	}

	// ── KRS ──────────────────────────────────────────────────────────

}

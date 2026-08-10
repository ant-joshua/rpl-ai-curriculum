import type { D1Database } from '@cloudflare/workers-types';
import { UniversitySemestersRepository, type AcademicSemesterRow } from './semesters.repository';

// ============================================================
// Course Catalog — split from university.repository.ts
// ============================================================
export interface CourseRow {
	id: string;
	tenant_id: string;
	study_program_id: string;
	code: string;
	name: string;
	sks: number;
	sks_praktikum: number | null;
	semester_level: number | null;
	type: string | null;
	kurikulum: string | null;
	prasyarat: string | null;
	deskripsi: string | null;
	learning_outcomes: string | null;
	created_at: string | null;
}


export class UniversityCoursesRepository extends UniversitySemestersRepository {
	async getCourseCatalog(opts: { studyProgramId?: string; semesterLevel?: number; type?: string } = {}): Promise<any[]> {
		let q = 'SELECT cc.*, sp.name AS study_program_name FROM course_catalog cc LEFT JOIN study_programs sp ON sp.id = cc.study_program_id WHERE cc.tenant_id = ?';
		const p: any[] = [this.tenantId];
		if (opts.studyProgramId) { q += ' AND cc.study_program_id = ?'; p.push(opts.studyProgramId); }
		if (opts.semesterLevel !== undefined) { q += ' AND cc.semester_level = ?'; p.push(opts.semesterLevel); }
		if (opts.type) { q += ' AND cc.type = ?'; p.push(opts.type); }
		q += ' ORDER BY cc.semester_level, cc.code';
		const rows = await this.db.prepare(q).bind(...p).all<any>();
		return rows.results || [];
	}

	async getCourse(id: string): Promise<any | null> {
		const row = await this.db.prepare(
			'SELECT cc.*, sp.name AS study_program_name FROM course_catalog cc LEFT JOIN study_programs sp ON sp.id = cc.study_program_id WHERE cc.id = ? AND cc.tenant_id = ?'
		).bind(id, this.tenantId).first<any>();
		return row || null;
	}

	async createCourse(data: {
		study_program_id: string; code: string; name: string; sks: number;
		sks_praktikum?: number; semester_level?: number; type?: string;
		kurikulum?: string; prasyarat?: string; deskripsi?: string; learning_outcomes?: string;
	}): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			`INSERT INTO course_catalog (id, tenant_id, study_program_id, code, name, sks, sks_praktikum, semester_level, type, kurikulum, prasyarat, deskripsi, learning_outcomes)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(id, this.tenantId, data.study_program_id, data.code, data.name, data.sks,
			data.sks_praktikum ?? 0, data.semester_level ?? null,
			data.type || 'wajib', data.kurikulum || null,
			data.prasyarat || null, data.deskripsi || null, data.learning_outcomes || null).run();
		return (await this.getCourse(id))!;
	}

	async updateCourse(id: string, data: Record<string, any>): Promise<any | null> {
		const keys = ['study_program_id', 'code', 'name', 'sks', 'sks_praktikum', 'semester_level', 'type', 'kurikulum', 'prasyarat', 'deskripsi', 'learning_outcomes'];
		const sets: string[] = [];
		const params: any[] = [];
		for (const k of keys) {
			if (data[k] !== undefined) { sets.push(`${k} = ?`); params.push(data[k]); }
		}
		if (sets.length === 0) return this.getCourse(id);
		params.push(id, this.tenantId);
		await this.db.prepare(`UPDATE course_catalog SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return this.getCourse(id);
	}

	async deleteCourse(id: string): Promise<boolean> {
		const r = await this.db.prepare('DELETE FROM course_catalog WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	// ── Kelas Kuliah ─────────────────────────────────────────────────

}

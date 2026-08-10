import type { D1Database } from '@cloudflare/workers-types';
import { UniversityFacultiesRepository } from './faculties.repository';

// ============================================================
// Academic Semesters — split from university.repository.ts
// ============================================================
export interface AcademicSemesterRow {
	id: string;
	tenant_id: string;
	study_program_id: string | null;
	name: string;
	type: string;
	year: string;
	is_active: number;
	start_date: string | null;
	end_date: string | null;
	drop_deadline: string | null;
	created_at: string | null;
}


export class UniversitySemestersRepository extends UniversityFacultiesRepository {
	async getSemesters(studyProgramId?: string): Promise<AcademicSemesterRow[]> {
		let q = 'SELECT * FROM academic_semesters WHERE tenant_id = ?';
		const p: any[] = [this.tenantId];
		if (studyProgramId) { q += ' AND study_program_id = ?'; p.push(studyProgramId); }
		q += ' ORDER BY year DESC, type';
		const rows = await this.db.prepare(q).bind(...p).all<AcademicSemesterRow>();
		return rows.results || [];
	}

	async getSemester(id: string): Promise<AcademicSemesterRow | null> {
		return this.db.prepare('SELECT * FROM academic_semesters WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).first<AcademicSemesterRow>();
	}

	async getActiveSemester(): Promise<AcademicSemesterRow | null> {
		return this.db.prepare('SELECT * FROM academic_semesters WHERE tenant_id = ? AND is_active = 1 LIMIT 1').bind(this.tenantId).first<AcademicSemesterRow>();
	}

	async createSemester(data: {
		study_program_id?: string; name: string; type: string; year: string;
		is_active?: number; start_date?: string; end_date?: string; drop_deadline?: string;
	}): Promise<AcademicSemesterRow> {
		if (data.is_active) {
			await this.db.prepare('UPDATE academic_semesters SET is_active = 0 WHERE tenant_id = ?').bind(this.tenantId).run();
		}
		const id = crypto.randomUUID();
		await this.db.prepare(
			`INSERT INTO academic_semesters (id, tenant_id, study_program_id, name, type, year, is_active, start_date, end_date, drop_deadline)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(id, this.tenantId, data.study_program_id || null, data.name,
			data.type, data.year, data.is_active ?? 0,
			data.start_date || null, data.end_date || null, data.drop_deadline || null).run();
		return (await this.getSemester(id))!;
	}

	async updateSemester(id: string, data: Record<string, any>): Promise<AcademicSemesterRow | null> {
		if (data.is_active) {
			await this.db.prepare('UPDATE academic_semesters SET is_active = 0 WHERE tenant_id = ?').bind(this.tenantId).run();
		}
		const keys = ['study_program_id', 'name', 'type', 'year', 'is_active', 'start_date', 'end_date', 'drop_deadline'];
		const sets: string[] = [];
		const params: any[] = [];
		for (const k of keys) {
			if (data[k] !== undefined) { sets.push(`${k} = ?`); params.push(data[k]); }
		}
		if (sets.length === 0) return this.getSemester(id);
		params.push(id, this.tenantId);
		await this.db.prepare(`UPDATE academic_semesters SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return this.getSemester(id);
	}

	// ── Course Catalog ───────────────────────────────────────────────

}

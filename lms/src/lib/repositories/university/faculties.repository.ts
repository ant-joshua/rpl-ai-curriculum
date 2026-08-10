import type { D1Database } from '@cloudflare/workers-types';

// ============================================================
// Faculties + Study Programs — split from university.repository.ts
// ============================================================
export interface FacultyRow {
	id: string;
	tenant_id: string;
	name: string;
	code: string | null;
	dean_id: string | null;
	created_at: string | null;
}

export interface StudyProgramRow {
	id: string;
	tenant_id: string;
	faculty_id: string;
	name: string;
	code: string | null;
	degree_type: string | null;
	total_sks: number | null;
	accreditation: string | null;
	kaprodi_id: string | null;
	created_at: string | null;
}


export class UniversityFacultiesRepository {
	protected db: D1Database;
	protected tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	async getFaculties(): Promise<any[]> {
		const rows = await this.db
			.prepare('SELECT f.*, u.display_name AS dean_name FROM faculties f LEFT JOIN users u ON u.id = f.dean_id WHERE f.tenant_id = ? ORDER BY f.name')
			.bind(this.tenantId)
			.all<any>();
		return rows.results || [];
	}

	async getFaculty(id: string): Promise<any | null> {
		const row = await this.db
			.prepare('SELECT f.*, u.display_name AS dean_name FROM faculties f LEFT JOIN users u ON u.id = f.dean_id WHERE f.id = ? AND f.tenant_id = ?')
			.bind(id, this.tenantId)
			.first<any>();
		return row || null;
	}

	async createFaculty(data: { name: string; code?: string; dean_id?: string }): Promise<any> {
		const id = crypto.randomUUID();
		await this.db
			.prepare('INSERT INTO faculties (id, tenant_id, name, code, dean_id) VALUES (?, ?, ?, ?, ?)')
			.bind(id, this.tenantId, data.name, data.code || null, data.dean_id || null)
			.run();
		return (await this.getFaculty(id))!;
	}

	async updateFaculty(id: string, data: { name?: string; code?: string; dean_id?: string }): Promise<any | null> {
		const sets: string[] = [];
		const params: any[] = [];
		if (data.name !== undefined) { sets.push('name = ?'); params.push(data.name); }
		if (data.code !== undefined) { sets.push('code = ?'); params.push(data.code); }
		if (data.dean_id !== undefined) { sets.push('dean_id = ?'); params.push(data.dean_id); }
		if (sets.length === 0) return this.getFaculty(id);
		params.push(id, this.tenantId);
		await this.db.prepare(`UPDATE faculties SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return this.getFaculty(id);
	}

	async deleteFaculty(id: string): Promise<boolean> {
		const r = await this.db.prepare('DELETE FROM faculties WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	// ── Study Programs ───────────────────────────────────────────────

	async getStudyPrograms(facultyId?: string): Promise<any[]> {
		let q = `SELECT sp.*, f.name AS faculty_name, u.display_name AS kaprodi_name
			FROM study_programs sp
			LEFT JOIN faculties f ON f.id = sp.faculty_id
			LEFT JOIN users u ON u.id = sp.kaprodi_id
			WHERE sp.tenant_id = ?`;
		const p: any[] = [this.tenantId];
		if (facultyId) { q += ' AND sp.faculty_id = ?'; p.push(facultyId); }
		q += ' ORDER BY sp.name';
		const rows = await this.db.prepare(q).bind(...p).all<any>();
		return rows.results || [];
	}

	async getStudyProgram(id: string): Promise<any | null> {
		return this.db.prepare(`SELECT sp.*, f.name AS faculty_name, u.display_name AS kaprodi_name
			FROM study_programs sp
			LEFT JOIN faculties f ON f.id = sp.faculty_id
			LEFT JOIN users u ON u.id = sp.kaprodi_id
			WHERE sp.id = ? AND sp.tenant_id = ?`).bind(id, this.tenantId).first<any>();
	}

	async createStudyProgram(data: {
		faculty_id: string; name: string; code?: string;
		degree_type?: string; total_sks?: number;
		accreditation?: string; kaprodi_id?: string;
	}): Promise<any> {
		const id = crypto.randomUUID();
		await this.db.prepare(
			`INSERT INTO study_programs (id, tenant_id, faculty_id, name, code, degree_type, total_sks, accreditation, kaprodi_id)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(id, this.tenantId, data.faculty_id, data.name, data.code || null,
			data.degree_type || 's1', data.total_sks ?? 144,
			data.accreditation || null, data.kaprodi_id || null).run();
		return (await this.getStudyProgram(id))!;
	}

	async updateStudyProgram(id: string, data: Record<string, any>): Promise<any | null> {
		const keys = ['faculty_id', 'name', 'code', 'degree_type', 'total_sks', 'accreditation', 'kaprodi_id'];
		const sets: string[] = [];
		const params: any[] = [];
		for (const k of keys) {
			if (data[k] !== undefined) { sets.push(`${k} = ?`); params.push(data[k]); }
		}
		if (sets.length === 0) return this.getStudyProgram(id);
		params.push(id, this.tenantId);
		await this.db.prepare(`UPDATE study_programs SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...params).run();
		return this.getStudyProgram(id);
	}

	async deleteStudyProgram(id: string): Promise<boolean> {
		const r = await this.db.prepare('DELETE FROM study_programs WHERE id = ? AND tenant_id = ?').bind(id, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	// ── Academic Semesters ───────────────────────────────────────────

}

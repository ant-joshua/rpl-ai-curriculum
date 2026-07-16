import type { D1Database } from '@cloudflare/workers-types';

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

export interface KRSRow {
	id: string;
	tenant_id: string;
	user_id: string;
	academic_semester_id: string;
	status: string;
	total_sks: number;
	ip_semester: number | null;
	approved_by: string | null;
	approved_at: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface KRSItemRow {
	id: string;
	krs_id: string;
	kelas_kuliah_id: string;
	status: string;
	dropped_at: string | null;
	grade_letter: string | null;
	grade_numeric: number | null;
	created_at: string | null;
}

export interface TranscriptRecordRow {
	id: string;
	tenant_id: string;
	user_id: string;
	course_catalog_id: string;
	kelas_kuliah_id: string | null;
	academic_semester_id: string;
	grade_letter: string | null;
	grade_numeric: number | null;
	sks: number;
	is_remedial: number;
	is_repeated: number;
	graded_by: string | null;
	graded_at: string | null;
	created_at: string | null;
}

export class UniversityRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	// ── Faculty ──────────────────────────────────────────────────────

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

	async createKRS(data: { user_id: string; academic_semester_id: string }): Promise<any> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db.prepare(
			`INSERT INTO krs (id, tenant_id, user_id, academic_semester_id, status, total_sks, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 'draft', 0, ?, ?)`
		).bind(id, this.tenantId, data.user_id, data.academic_semester_id, now, now).run();
		return this.getKRS(id);
	}

	async getKRS(krsId: string): Promise<any | null> {
		const row = await this.db.prepare(`
			SELECT k.*, s.name AS semester_name, s.type AS semester_type, s.year AS semester_year,
				u.display_name AS mahasiswa_name
			FROM krs k
			JOIN academic_semesters s ON s.id = k.academic_semester_id
			LEFT JOIN users u ON u.id = k.user_id
			WHERE k.id = ? AND k.tenant_id = ?
		`).bind(krsId, this.tenantId).first<any>();
		if (!row) return null;
		const items = await this.db.prepare(`
			SELECT ki.*, kk.code AS kelas_kode, kk.dosen_id, kk.schedule_json,
				cc.code AS course_code, cc.name AS course_name, cc.sks, cc.sks_praktikum
			FROM krs_items ki
			JOIN kelas_kuliah kk ON kk.id = ki.kelas_kuliah_id
			JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			WHERE ki.krs_id = ? AND ki.status != 'dropped'
			ORDER BY cc.code
		`).bind(krsId).all<any>();
		return { ...row, items: items.results || [] };
	}

	async getKRSByUser(userId: string, semesterId: string): Promise<any | null> {
		const row = await this.db.prepare(
			'SELECT * FROM krs WHERE user_id = ? AND academic_semester_id = ? AND tenant_id = ?'
		).bind(userId, semesterId, this.tenantId).first<any>();
		if (!row) return null;
		return this.getKRS(row.id);
	}

	async getPendingKRS(semesterId?: string): Promise<any[]> {
		let q = `SELECT k.*, u.display_name AS mahasiswa_name, u.email
			FROM krs k
			JOIN users u ON u.id = k.user_id
			WHERE k.status = 'submitted' AND k.tenant_id = ?`;
		const p: any[] = [this.tenantId];
		if (semesterId) { q += ' AND k.academic_semester_id = ?'; p.push(semesterId); }
		q += ' ORDER BY k.updated_at';
		const rows = await this.db.prepare(q).bind(...p).all<any>();
		return rows.results || [];
	}

	async addKRSItem(krsId: string, kelasKuliahId: string): Promise<KRSItemRow> {
		const krs = await this.db.prepare('SELECT * FROM krs WHERE id = ? AND tenant_id = ?').bind(krsId, this.tenantId).first<any>();
		if (!krs) throw new Error('KRS not found');
		if (krs.status !== 'draft') throw new Error('KRS is not in draft status');

		const dup = await this.db.prepare("SELECT id FROM krs_items WHERE krs_id = ? AND kelas_kuliah_id = ? AND status = 'active'").bind(krsId, kelasKuliahId).first<any>();
		if (dup) throw new Error('Course already added to KRS');

		const kelas = await this.db.prepare(
			'SELECT cc.sks FROM kelas_kuliah kk JOIN course_catalog cc ON cc.id = kk.course_catalog_id WHERE kk.id = ? AND kk.tenant_id = ?'
		).bind(kelasKuliahId, this.tenantId).first<{ sks: number }>();
		if (!kelas) throw new Error('Kelas kuliah not found');

		const newTotal = (krs.total_sks || 0) + kelas.sks;
		if (newTotal > 24) throw new Error(`Total SKS would exceed max 24 (current: ${krs.total_sks}, adding: ${kelas.sks})`);

		const itemId = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.batch([
			this.db.prepare("INSERT INTO krs_items (id, krs_id, kelas_kuliah_id, status, created_at) VALUES (?, ?, ?, 'active', ?)").bind(itemId, krsId, kelasKuliahId, now),
			this.db.prepare('UPDATE krs SET total_sks = ?, updated_at = ? WHERE id = ?').bind(newTotal, now, krsId)
		]);

		return { id: itemId, krs_id: krsId, kelas_kuliah_id: kelasKuliahId, status: 'active', dropped_at: null, grade_letter: null, grade_numeric: null, created_at: now };
	}

	async removeKRSItem(krsItemId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs_items SET status = 'dropped', dropped_at = ? WHERE id = ?").bind(new Date().toISOString(), krsItemId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async submitKRS(krsId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs SET status = 'submitted', updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'draft'").bind(new Date().toISOString(), krsId, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async approveKRS(krsId: string, approverId: string): Promise<boolean> {
		const krs = await this.db.prepare("SELECT * FROM krs WHERE id = ? AND tenant_id = ? AND status = 'submitted'").bind(krsId, this.tenantId).first<any>();
		if (!krs) return false;
		const now = new Date().toISOString();
		const items = await this.db.prepare("SELECT * FROM krs_items WHERE krs_id = ? AND status = 'active'").bind(krsId).all<any>();
		const activeItems = items.results || [];
		const stmts: any[] = [
			this.db.prepare('UPDATE krs SET status = \'approved\', approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?').bind(approverId, now, now, krsId)
		];
		for (const item of activeItems) {
			stmts.push(this.db.prepare('UPDATE kelas_kuliah SET current_students = current_students + 1 WHERE id = ?').bind(item.kelas_kuliah_id));
		}
		await this.db.batch(stmts);
		return true;
	}

	async rejectKRS(krsId: string): Promise<boolean> {
		const r = await this.db.prepare("UPDATE krs SET status = 'revision', updated_at = ? WHERE id = ? AND tenant_id = ? AND status = 'submitted'").bind(new Date().toISOString(), krsId, this.tenantId).run();
		return (r.meta.changes ?? 0) > 0;
	}

	async getStudentsWithGrades(kelasKuliahId: string): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT ki.id AS krs_item_id, ki.grade_numeric, ki.grade_letter,
				u.id AS user_id, u.display_name AS student_name, u.email,
				cc.sks, cc.name AS course_name, cc.code AS course_code
			FROM krs_items ki
			JOIN krs ON krs.id = ki.krs_id
			JOIN users u ON u.id = krs.user_id
			JOIN kelas_kuliah kk ON kk.id = ki.kelas_kuliah_id
			JOIN course_catalog cc ON cc.id = kk.course_catalog_id
			WHERE ki.kelas_kuliah_id = ? AND krs.status = 'approved' AND ki.status = 'active'
			ORDER BY u.display_name
		`).bind(kelasKuliahId).all<any>();
		return rows.results || [];
	}

	async saveGrades(grades: { krs_item_id: string; grade_numeric: number }[]): Promise<void> {
		const stmts = grades.map((g) => {
			const letter = this.numericToLetter(g.grade_numeric);
			return this.db.prepare('UPDATE krs_items SET grade_numeric = ?, grade_letter = ? WHERE id = ?').bind(g.grade_numeric, letter, g.krs_item_id);
		});
		if (stmts.length > 0) await this.db.batch(stmts);
	}

	// ── Transcript ───────────────────────────────────────────────────

	async getTranscript(userId: string): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT tr.*, cc.code AS course_code, cc.name AS course_name, cc.sks,
				s.name AS semester_name, s.type AS semester_type, s.year AS semester_year
			FROM transcript_records tr
			JOIN course_catalog cc ON cc.id = tr.course_catalog_id
			JOIN academic_semesters s ON s.id = tr.academic_semester_id
			WHERE tr.user_id = ? AND tr.tenant_id = ?
			ORDER BY s.year, s.type, cc.code
		`).bind(userId, this.tenantId).all<any>();
		return rows.results || [];
	}

	async computeIPK(userId: string): Promise<number | null> {
		const rows = await this.db.prepare(
			`SELECT grade_numeric, grade_letter, sks FROM transcript_records
			 WHERE user_id = ? AND tenant_id = ? AND is_repeated = 0`
		).bind(userId, this.tenantId).all<any>();
		const records = rows.results || [];
		if (records.length === 0) return null;
		let totalPointSks = 0;
		let totalSks = 0;
		for (const r of records) {
			const point = r.grade_numeric ?? this.letterToPoint(r.grade_letter);
			totalPointSks += point * r.sks;
			totalSks += r.sks;
		}
		if (totalSks === 0) return null;
		return Math.round((totalPointSks / totalSks) * 100) / 100;
	}

	// ── Helpers ──────────────────────────────────────────────────────

	numericToLetter(score: number): string {
		if (score >= 80) return 'A';
		if (score >= 75) return 'A-';
		if (score >= 70) return 'B+';
		if (score >= 65) return 'B';
		if (score >= 60) return 'B-';
		if (score >= 55) return 'C+';
		if (score >= 50) return 'C';
		if (score >= 40) return 'D';
		return 'E';
	}

	letterToPoint(letter: string | null): number {
		switch (letter) {
			case 'A': return 4.0;
			case 'A-': return 3.7;
			case 'B+': return 3.3;
			case 'B': return 3.0;
			case 'B-': return 2.7;
			case 'C+': return 2.3;
			case 'C': return 2.0;
			case 'D': return 1.0;
			case 'E': return 0.0;
			default: return 0.0;
		}
	}
}

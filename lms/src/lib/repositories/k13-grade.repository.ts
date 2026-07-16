import type { D1Database } from '@cloudflare/workers-types';
import { calcNilaiPengetahuan, calcNilaiKeterampilan, getPredikat } from '$lib/grading/k13-calc';

interface PhScoreRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	title: string | null;
	score: number;
	max_score: number;
	remedial_score: number | null;
	semester: number;
}

interface PtsRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score: number;
	remedial_score: number | null;
}

interface PasRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score: number;
	remedial_score: number | null;
}

interface SkillsRow {
	id: string;
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	type: string;
	title: string | null;
	score: number;
	max_score: number;
	remedial_score: number | null;
	semester: number;
}

interface StudentInfo {
	user_id: string;
	nis: string | null;
	display_name: string;
	email: string;
}

interface GradeRecapItem extends StudentInfo {
	ph_scores: { kd_id: string; score: number; max_score: number }[];
	ph_average: number;
	pts_score: number | null;
	pas_score: number | null;
	na_pengetahuan: number;
	predikat_pengetahuan: string;
	keterampilan_scores: { kd_id: string; type: string; score: number }[];
	na_keterampilan: number;
	predikat_keterampilan: string;
}

interface GradeSummaryItem {
	subject_id: string;
	subject_name: string;
	subject_code: string | null;
	class_subject_id: string;
	na_pengetahuan: number;
	predikat_pengetahuan: string;
	na_keterampilan: number;
	predikat_keterampilan: string;
}

export interface SavePhInput {
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	title?: string;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	semester: number;
	academic_year?: string;
	graded_by: string;
}

export interface SavePtsInput {
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	academic_year?: string;
	graded_by: string;
}

export interface SavePasInput {
	user_id: string;
	class_subject_id: string;
	semester: number;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	academic_year?: string;
	graded_by: string;
}

export interface SaveSkillsInput {
	user_id: string;
	class_subject_id: string;
	kompetensi_dasar_id: string;
	type: string;
	title?: string;
	score: number;
	max_score?: number;
	remedial_score?: number | null;
	semester: number;
	academic_year?: string;
	graded_by: string;
}

export interface SaveAttitudeInput {
	user_id: string;
	class_id: string;
	competence_type: string;
	semester: number;
	predikat: string;
	deskripsi?: string;
	academic_year?: string;
	graded_by: string;
}

export interface SaveExtracurricularInput {
	user_id: string;
	class_id: string;
	activity_name: string;
	predikat: string;
	deskripsi?: string;
	semester: number;
	academic_year?: string;
	academic_period_id?: string;
	graded_by: string;
}

export class K13GradeRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	/**
	 * Get all PH (Penilaian Harian) scores for a class_subject in a semester,
	 * grouped by student with associated KD info.
	 */
	async getPhByClassSubject(classSubjectId: string, semester: number): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT
				ph.*,
				kd.code AS kd_code,
				kd.description AS kd_description
			FROM k13_ph ph
			LEFT JOIN kompetensi_dasar kd ON kd.id = ph.kompetensi_dasar_id
			WHERE ph.class_subject_id = ? AND ph.semester = ? AND ph.tenant_id = ?
			ORDER BY ph.user_id, ph.kompetensi_dasar_id
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		return rows.results || [];
	}

	/**
	 * Get all PTS (Penilaian Tengah Semester) scores for a class_subject in a semester.
	 */
	async getPtsByClassSubject(classSubjectId: string, semester: number): Promise<PtsRow[]> {
		const rows = await this.db.prepare(`
			SELECT * FROM k13_pts
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<PtsRow>();

		return rows.results || [];
	}

	/**
	 * Get all PAS (Penilaian Akhir Semester) scores for a class_subject in a semester.
	 */
	async getPasByClassSubject(classSubjectId: string, semester: number): Promise<PasRow[]> {
		const rows = await this.db.prepare(`
			SELECT * FROM k13_pas
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<PasRow>();

		return rows.results || [];
	}

	/**
	 * Get all Keterampilan (skills) scores for a class_subject in a semester.
	 */
	async getSkillsByClassSubject(classSubjectId: string, semester: number): Promise<any[]> {
		const rows = await this.db.prepare(`
			SELECT
				sk.*,
				kd.code AS kd_code,
				kd.description AS kd_description
			FROM k13_skills sk
			LEFT JOIN kompetensi_dasar kd ON kd.id = sk.kompetensi_dasar_id
			WHERE sk.class_subject_id = ? AND sk.semester = ? AND sk.tenant_id = ?
			ORDER BY sk.user_id, sk.kompetensi_dasar_id, sk.type
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		return rows.results || [];
	}

	/**
	 * Batch insert or update PH (Penilaian Harian) scores.
	 */
	async savePhBatch(data: SavePhInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_ph (id, tenant_id, user_id, class_subject_id, kompetensi_dasar_id, title, score, max_score, remedial_score, semester, academic_year, graded_by, graded_at, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(user_id, class_subject_id, kompetensi_dasar_id, semester)
					DO UPDATE SET score = excluded.score, max_score = excluded.max_score, remedial_score = excluded.remedial_score, title = excluded.title, graded_by = excluded.graded_by, graded_at = excluded.graded_at
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_subject_id,
					d.kompetensi_dasar_id,
					d.title || null,
					d.score,
					d.max_score ?? 100,
					d.remedial_score ?? null,
					d.semester,
					d.academic_year || null,
					d.graded_by,
					now,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Batch upsert PTS (Penilaian Tengah Semester) scores.
	 */
	async savePts(data: SavePtsInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_pts (id, tenant_id, user_id, class_subject_id, semester, academic_year, score, max_score, remedial_score, graded_by, graded_at, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(user_id, class_subject_id, semester)
					DO UPDATE SET score = excluded.score, max_score = excluded.max_score, remedial_score = excluded.remedial_score, graded_by = excluded.graded_by, graded_at = excluded.graded_at
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_subject_id,
					d.semester,
					d.academic_year || null,
					d.score,
					d.max_score ?? 100,
					d.remedial_score ?? null,
					d.graded_by,
					now,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Batch upsert PAS (Penilaian Akhir Semester) scores.
	 */
	async savePas(data: SavePasInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_pas (id, tenant_id, user_id, class_subject_id, semester, academic_year, score, max_score, remedial_score, graded_by, graded_at, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(user_id, class_subject_id, semester)
					DO UPDATE SET score = excluded.score, max_score = excluded.max_score, remedial_score = excluded.remedial_score, graded_by = excluded.graded_by, graded_at = excluded.graded_at
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_subject_id,
					d.semester,
					d.academic_year || null,
					d.score,
					d.max_score ?? 100,
					d.remedial_score ?? null,
					d.graded_by,
					now,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Batch insert Keterampilan (skills) scores.
	 */
	async saveSkillsBatch(data: SaveSkillsInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_skills (id, tenant_id, user_id, class_subject_id, kompetensi_dasar_id, type, title, score, max_score, remedial_score, semester, academic_year, graded_by, graded_at, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_subject_id,
					d.kompetensi_dasar_id,
					d.type,
					d.title || null,
					d.score,
					d.max_score ?? 100,
					d.remedial_score ?? null,
					d.semester,
					d.academic_year || null,
					d.graded_by,
					now,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Batch upsert Sikap (attitude) scores.
	 */
	async saveAttitude(data: SaveAttitudeInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_attitude (id, tenant_id, user_id, class_id, competence_type, semester, academic_year, predikat, deskripsi, graded_by, graded_at, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
					ON CONFLICT(user_id, class_id, competence_type, semester)
					DO UPDATE SET predikat = excluded.predikat, deskripsi = excluded.deskripsi, graded_by = excluded.graded_by, graded_at = excluded.graded_at
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_id,
					d.competence_type,
					d.semester,
					d.academic_year || null,
					d.predikat,
					d.deskripsi || null,
					d.graded_by,
					now,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Batch insert Ekstrakurikuler (extracurricular) scores.
	 */
	async saveExtracurricular(data: SaveExtracurricularInput[]): Promise<void> {
		const now = new Date().toISOString();
		const stmts = data.map((d) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(`
					INSERT INTO k13_extracurricular (id, tenant_id, user_id, class_id, activity_name, predikat, deskripsi, semester, academic_year, academic_period_id, graded_by, created_at)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`)
				.bind(
					id,
					this.tenantId,
					d.user_id,
					d.class_id,
					d.activity_name,
					d.predikat,
					d.deskripsi || null,
					d.semester,
					d.academic_year || null,
					d.academic_period_id || null,
					d.graded_by,
					now
				);
		});

		if (stmts.length > 0) {
			await this.db.batch(stmts);
		}
	}

	/**
	 * Get full grade recap for a class_subject in a semester.
	 * Returns all students with computed NA (Nilai Akhir) for Pengetahuan and Keterampilan.
	 */
	async getGradeRecap(classSubjectId: string, semester: number): Promise<GradeRecapItem[]> {
		// Get class info first
		const cs = await this.db.prepare(`
			SELECT c.id AS class_id
			FROM class_subjects cs
			JOIN classes c ON c.id = cs.class_id
			WHERE cs.id = ?
		`).bind(classSubjectId).first<any>();

		if (!cs) return [];

		// Get all students
		const students = await this.db.prepare(`
			SELECT cm.user_id, cm.nis, u.display_name, u.email
			FROM class_members cm
			JOIN users u ON u.id = cm.user_id
			WHERE cm.class_id = ? AND cm.role = 'student'
			ORDER BY cm.nis
		`).bind(cs.class_id).all<StudentInfo>();

		const studentList: StudentInfo[] = students.results || [];
		if (studentList.length === 0) return [];

		const userIds = studentList.map(s => s.user_id);

		// Get all PH scores for these students
		const phRows = await this.db.prepare(`
			SELECT * FROM k13_ph
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		const phByUser: Record<string, any[]> = {};
		for (const row of (phRows.results || [])) {
			if (!phByUser[row.user_id]) phByUser[row.user_id] = [];
			phByUser[row.user_id].push(row);
		}

		// Get all PTS scores
		const ptsRows = await this.db.prepare(`
			SELECT * FROM k13_pts
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		const ptsByUser: Record<string, any> = {};
		for (const row of (ptsRows.results || [])) {
			ptsByUser[row.user_id] = row;
		}

		// Get all PAS scores
		const pasRows = await this.db.prepare(`
			SELECT * FROM k13_pas
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		const pasByUser: Record<string, any> = {};
		for (const row of (pasRows.results || [])) {
			pasByUser[row.user_id] = row;
		}

		// Get all skills scores
		const skillsRows = await this.db.prepare(`
			SELECT * FROM k13_skills
			WHERE class_subject_id = ? AND semester = ? AND tenant_id = ?
		`).bind(classSubjectId, semester, this.tenantId).all<any>();

		const skillsByUser: Record<string, any[]> = {};
		for (const row of (skillsRows.results || [])) {
			if (!skillsByUser[row.user_id]) skillsByUser[row.user_id] = [];
			skillsByUser[row.user_id].push(row);
		}

		// Get weight config
		const weightConfig = await this.db.prepare(`
			SELECT * FROM k13_weight_config
			WHERE tenant_id = ? AND is_active = 1
			ORDER BY created_at DESC LIMIT 1
		`).bind(this.tenantId).first<any>();

		const weights = weightConfig
			? { ph: weightConfig.ph_weight, pts: weightConfig.pts_weight, pas: weightConfig.pas_weight }
			: undefined;

		const thresholds = weightConfig
			? { A: weightConfig.a_threshold, B: weightConfig.b_threshold, C: weightConfig.c_threshold }
			: undefined;

		// Build recap for each student
		const recap: GradeRecapItem[] = studentList.map((student) => {
			const phScores = (phByUser[student.user_id] || []).map((ph: any) => ({
				kd_id: ph.kompetensi_dasar_id,
				score: ph.score,
				max_score: ph.max_score
			}));

			const ptsScore = ptsByUser[student.user_id]?.score ?? null;
			const pasScore = pasByUser[student.user_id]?.score ?? null;

			const naPengetahuan = calcNilaiPengetahuan(
				phScores,
				ptsScore,
				pasScore,
				weights
			);

			const keterampilanScores = (skillsByUser[student.user_id] || []).map((sk: any) => ({
				kd_id: sk.kompetensi_dasar_id,
				type: sk.type,
				score: sk.score
			}));

			const rawSkillsScores = keterampilanScores.map(s => s.score);
			const naKeterampilan = calcNilaiKeterampilan(rawSkillsScores);

			return {
				...student,
				ph_scores: phScores,
				ph_average: phScores.length > 0
					? phScores.reduce((sum, s) => sum + s.score, 0) / phScores.length
					: 0,
				pts_score: ptsScore,
				pas_score: pasScore,
				na_pengetahuan: Math.round(naPengetahuan * 100) / 100,
				predikat_pengetahuan: getPredikat(naPengetahuan, thresholds),
				keterampilan_scores: keterampilanScores,
				na_keterampilan: Math.round(naKeterampilan * 100) / 100,
				predikat_keterampilan: getPredikat(naKeterampilan, thresholds)
			};
		});

		return recap;
	}

	/**
	 * Get grade summary for a student across all subjects in a class+semester.
	 * Used for rapor (report card) display.
	 */
	async getGradeSummary(userId: string, classId: string, semester: number): Promise<GradeSummaryItem[]> {
		// Get all class_subjects for this class and semester
		const subjects = await this.db.prepare(`
			SELECT
				cs.id AS class_subject_id,
				cs.subject_id,
				s.name AS subject_name,
				s.code AS subject_code
			FROM class_subjects cs
			JOIN subjects s ON s.id = cs.subject_id
			WHERE cs.class_id = ? AND cs.semester = ? AND cs.tenant_id = ? AND cs.status = 'active'
			ORDER BY s.name ASC
		`).bind(classId, semester, this.tenantId).all<any>();

		const subjectList = subjects.results || [];
		if (subjectList.length === 0) return [];

		// Get weight config
		const weightConfig = await this.db.prepare(`
			SELECT * FROM k13_weight_config
			WHERE tenant_id = ? AND is_active = 1
			ORDER BY created_at DESC LIMIT 1
		`).bind(this.tenantId).first<any>();

		const weights = weightConfig
			? { ph: weightConfig.ph_weight, pts: weightConfig.pts_weight, pas: weightConfig.pas_weight }
			: undefined;

		const thresholds = weightConfig
			? { A: weightConfig.a_threshold, B: weightConfig.b_threshold, C: weightConfig.c_threshold }
			: undefined;

		// For each subject, compute NA
		const summaries: GradeSummaryItem[] = [];

		for (const subj of subjectList) {
			// PH
			const phRows = await this.db.prepare(`
				SELECT score, max_score FROM k13_ph
				WHERE user_id = ? AND class_subject_id = ? AND semester = ? AND tenant_id = ?
			`).bind(userId, subj.class_subject_id, semester, this.tenantId).all<any>();

			const phScores = (phRows.results || []).map((ph: any) => ({
				score: ph.score,
				max_score: ph.max_score
			}));

			// PTS
			const ptsRow = await this.db.prepare(`
				SELECT score FROM k13_pts
				WHERE user_id = ? AND class_subject_id = ? AND semester = ? AND tenant_id = ?
			`).bind(userId, subj.class_subject_id, semester, this.tenantId).first<any>();

			const ptsScore = ptsRow?.score ?? null;

			// PAS
			const pasRow = await this.db.prepare(`
				SELECT score FROM k13_pas
				WHERE user_id = ? AND class_subject_id = ? AND semester = ? AND tenant_id = ?
			`).bind(userId, subj.class_subject_id, semester, this.tenantId).first<any>();

			const pasScore = pasRow?.score ?? null;

			// Skills
			const skillsRows = await this.db.prepare(`
				SELECT score FROM k13_skills
				WHERE user_id = ? AND class_subject_id = ? AND semester = ? AND tenant_id = ?
			`).bind(userId, subj.class_subject_id, semester, this.tenantId).all<any>();

			const skillsScores = (skillsRows.results || []).map((sk: any) => sk.score);

			const naPengetahuan = calcNilaiPengetahuan(phScores, ptsScore, pasScore, weights);
			const naKeterampilan = calcNilaiKeterampilan(skillsScores);

			summaries.push({
				subject_id: subj.subject_id,
				subject_name: subj.subject_name,
				subject_code: subj.subject_code,
				class_subject_id: subj.class_subject_id,
				na_pengetahuan: Math.round(naPengetahuan * 100) / 100,
				predikat_pengetahuan: getPredikat(naPengetahuan, thresholds),
				na_keterampilan: Math.round(naKeterampilan * 100) / 100,
				predikat_keterampilan: getPredikat(naKeterampilan, thresholds)
			});
		}

		return summaries;
	}
}

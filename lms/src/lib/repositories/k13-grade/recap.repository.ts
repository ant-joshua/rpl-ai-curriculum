import type { D1Database } from '@cloudflare/workers-types';
import { K13GradeSaveRepository } from './save.repository';
import type { GradeRecapItem, GradeSummaryItem, StudentInfo } from './types.repository';
import { calcNilaiPengetahuan, calcNilaiKeterampilan, getPredikat } from '$lib/grading/k13-calc';

export class K13GradeRecapRepository extends K13GradeSaveRepository {
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

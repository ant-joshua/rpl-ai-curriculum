import type { D1Database } from '@cloudflare/workers-types';
import { K13GradeTypes } from './types.repository';
import type { PtsRow, PasRow } from './types.repository';

export class K13GradeScoresRepository extends K13GradeTypes {
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
}

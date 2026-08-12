import type { D1Database } from '@cloudflare/workers-types';
import { K13GradeScoresRepository } from './scores.repository';
import type { SavePhInput, SavePtsInput, SavePasInput, SaveSkillsInput, SaveAttitudeInput, SaveExtracurricularInput } from './types.repository';

export class K13GradeSaveRepository extends K13GradeScoresRepository {
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
}

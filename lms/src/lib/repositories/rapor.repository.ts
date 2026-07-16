import type { D1Database } from '@cloudflare/workers-types';
import { K13GradeRepository } from './k13-grade.repository';

interface RaporRow {
	id: string;
	tenant_id: string;
	user_id: string;
	class_id: string;
	academic_period_id: string;
	semester: number;
	status: 'draft' | 'finalized' | 'printed';
	subject_grades: string | null;
	attendance_sick: number;
	attendance_permit: number;
	attendance_absent: number;
	attitude_spiritual: string | null;
	attitude_spiritual_desc: string | null;
	attitude_social: string | null;
	attitude_social_desc: string | null;
	extracurriculars: string | null;
	homeroom_notes: string | null;
	finalized_by: string | null;
	finalized_at: string | null;
	printed_count: number;
	printed_at: string | null;
	created_at: string;
	updated_at: string;
}

interface AttitudeResult {
	spiritual: { predikat: string; deskripsi: string | null } | null;
	sosial: { predikat: string; deskripsi: string | null } | null;
}

interface ExtracurricularItem {
	activity_name: string;
	predikat: string;
	deskripsi: string | null;
}

export interface RaporDetail extends Omit<RaporRow, 'subject_grades' | 'extracurriculars'> {
	subject_grades: any[];
	extracurriculars: ExtracurricularItem[];
	display_name?: string;
	nis?: string;
}

export class RaporRepository {
	private db: D1Database;
	private tenantId: string;
	private gradeRepo: K13GradeRepository;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
		this.gradeRepo = new K13GradeRepository(db, tenantId);
	}

	/**
	 * Get grade summary for a student across all subjects.
	 * Delegates to K13GradeRepository.
	 */
	async getGradeSummary(userId: string, classId: string, semester: number) {
		return this.gradeRepo.getGradeSummary(userId, classId, semester);
	}

	/**
	 * Get attitude scores (spiritual & social) for a student.
	 */
	async getAttitude(userId: string, classId: string, semester: number): Promise<AttitudeResult> {
		const rows = await this.db.prepare(`
			SELECT competence_type, predikat, deskripsi FROM k13_attitude
			WHERE user_id = ? AND class_id = ? AND semester = ? AND tenant_id = ?
		`).bind(userId, classId, semester, this.tenantId).all<any>();

		const result: AttitudeResult = { spiritual: null, sosial: null };
		for (const row of (rows.results || [])) {
			if (row.competence_type === 'spiritual') {
				result.spiritual = { predikat: row.predikat, deskripsi: row.deskripsi };
			} else if (row.competence_type === 'social') {
				result.sosial = { predikat: row.predikat, deskripsi: row.deskripsi };
			}
		}
		return result;
	}

	/**
	 * Get extracurricular activities for a student.
	 */
	async getExtracurriculars(userId: string, classId: string, semester: number): Promise<ExtracurricularItem[]> {
		const rows = await this.db.prepare(`
			SELECT activity_name, predikat, deskripsi FROM k13_extracurricular
			WHERE user_id = ? AND class_id = ? AND semester = ? AND tenant_id = ?
			ORDER BY activity_name
		`).bind(userId, classId, semester, this.tenantId).all<ExtracurricularItem>();

		return rows.results || [];
	}

	/**
	 * Generate a rapor for a student by computing all grades.
	 * Creates or updates rapor_k13 record.
	 */
	async generateRapor(
		userId: string,
		classId: string,
		academicPeriodId: string,
		semester: number
	): Promise<RaporDetail> {
		// Get all component data
		const subjects = await this.getGradeSummary(userId, classId, semester);
		const attitude = await this.getAttitude(userId, classId, semester);
		const extracurriculars = await this.getExtracurriculars(userId, classId, semester);

		const subjectGradesJson = JSON.stringify(subjects);
		const extracurricularsJson = JSON.stringify(extracurriculars);

		const now = new Date().toISOString();
		const id = crypto.randomUUID();

		// Upsert rapor_k13
		await this.db.prepare(`
			INSERT INTO rapor_k13 (id, tenant_id, user_id, class_id, academic_period_id, semester, status, subject_grades, attitude_spiritual, attitude_spiritual_desc, attitude_social, attitude_social_desc, extracurriculars, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(user_id, class_id, academic_period_id, semester)
			DO UPDATE SET
				subject_grades = excluded.subject_grades,
				attitude_spiritual = excluded.attitude_spiritual,
				attitude_spiritual_desc = excluded.attitude_spiritual_desc,
				attitude_social = excluded.attitude_social,
				attitude_social_desc = excluded.attitude_social_desc,
				extracurriculars = excluded.extracurriculars,
				updated_at = excluded.updated_at,
				status = 'draft',
				finalized_by = NULL,
				finalized_at = NULL
		`).bind(
			id,
			this.tenantId,
			userId,
			classId,
			academicPeriodId,
			semester,
			subjectGradesJson,
			attitude.spiritual?.predikat || null,
			attitude.spiritual?.deskripsi || null,
			attitude.sosial?.predikat || null,
			attitude.sosial?.deskripsi || null,
			extracurricularsJson,
			now,
			now
		).run();

		// Get the inserted/updated rapor
		const rapor = await this.db.prepare(`
			SELECT * FROM rapor_k13
			WHERE user_id = ? AND class_id = ? AND academic_period_id = ? AND semester = ? AND tenant_id = ?
		`).bind(userId, classId, academicPeriodId, semester, this.tenantId).first<any>();

		await this.logAudit(rapor?.id || id, 'create', userId);

		return this.mapRaporRow(rapor);
	}

	/**
	 * Get a single rapor by ID.
	 */
	async getRapor(raporId: string): Promise<RaporDetail | null> {
		const row = await this.db.prepare(`
			SELECT r.*, u.display_name, cm.nis
			FROM rapor_k13 r
			LEFT JOIN users u ON u.id = r.user_id
			LEFT JOIN class_members cm ON cm.user_id = r.user_id AND cm.class_id = r.class_id
			WHERE r.id = ? AND r.tenant_id = ?
		`).bind(raporId, this.tenantId).first<any>();

		if (!row) return null;
		return this.mapRaporRow(row);
	}

	/**
	 * Get a single rapor by user, class, and semester.
	 */
	async getRaporByUser(userId: string, classId: string, semester: number): Promise<RaporDetail | null> {
		const row = await this.db.prepare(`
			SELECT r.*, u.display_name, cm.nis
			FROM rapor_k13 r
			LEFT JOIN users u ON u.id = r.user_id
			LEFT JOIN class_members cm ON cm.user_id = r.user_id AND cm.class_id = r.class_id
			WHERE r.user_id = ? AND r.class_id = ? AND r.semester = ? AND r.tenant_id = ?
		`).bind(userId, classId, semester, this.tenantId).first<any>();

		if (!row) return null;
		return this.mapRaporRow(row);
	}

	/**
	 * List all rapors for a class and semester, with student info.
	 */
	async listRaporByClass(classId: string, semester: number): Promise<RaporDetail[]> {
		const rows = await this.db.prepare(`
			SELECT r.*, u.display_name, cm.nis
			FROM rapor_k13 r
			LEFT JOIN users u ON u.id = r.user_id
			LEFT JOIN class_members cm ON cm.user_id = r.user_id AND cm.class_id = r.class_id
			WHERE r.class_id = ? AND r.semester = ? AND r.tenant_id = ?
			ORDER BY cm.nis ASC
		`).bind(classId, semester, this.tenantId).all<any>();

		return (rows.results || []).map(row => this.mapRaporRow(row));
	}

	/**
	 * Finalize a rapor (set status to 'finalized').
	 */
	async finalizeRapor(raporId: string, actorId: string, homeroomNotes?: string): Promise<RaporDetail | null> {
		const now = new Date().toISOString();

		let sql = `UPDATE rapor_k13 SET status = 'finalized', finalized_by = ?, finalized_at = ?, updated_at = ?`;
		const params: any[] = [actorId, now, now];

		if (homeroomNotes !== undefined) {
			sql += `, homeroom_notes = ?`;
			params.push(homeroomNotes);
		}

		sql += ` WHERE id = ? AND tenant_id = ?`;
		params.push(raporId, this.tenantId);

		await this.db.prepare(sql).bind(...params).run();
		await this.logAudit(raporId, 'finalize', actorId, homeroomNotes);

		return this.getRapor(raporId);
	}

	/**
	 * Unlock a rapor (set status back to 'draft' for admin correction).
	 */
	async unlockRapor(raporId: string, actorId: string): Promise<RaporDetail | null> {
		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE rapor_k13 SET status = 'draft', finalized_by = NULL, finalized_at = NULL, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(now, raporId, this.tenantId).run();

		await this.logAudit(raporId, 'unlock', actorId);

		return this.getRapor(raporId);
	}

	/**
	 * Update homeroom notes on a rapor.
	 */
	async updateNotes(raporId: string, homeroomNotes: string, actorId: string): Promise<RaporDetail | null> {
		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE rapor_k13 SET homeroom_notes = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(homeroomNotes, now, raporId, this.tenantId).run();

		await this.logAudit(raporId, 'edit_notes', actorId);

		return this.getRapor(raporId);
	}

	/**
	 * Increment the printed count on a rapor.
	 */
	async incrementPrintCount(raporId: string): Promise<void> {
		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE rapor_k13 SET printed_count = printed_count + 1, printed_at = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(now, now, raporId, this.tenantId).run();
	}

	/**
	 * Log an audit trail entry for a rapor action.
	 */
	async logAudit(raporId: string, action: string, actorId: string, notes?: string): Promise<void> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.prepare(`
			INSERT INTO rapor_audit_log (id, tenant_id, rapor_id, action, actor_id, notes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`).bind(id, this.tenantId, raporId, action, actorId, notes || null, now).run();
	}

	/**
	 * Delete a rapor and its audit logs for a specific user/class/semester.
	 */
	async deleteRapor(userId: string, classId: string, semester: number): Promise<void> {
		// Find the rapor first to get its ID
		const rapor = await this.db.prepare(`
			SELECT id FROM rapor_k13
			WHERE user_id = ? AND class_id = ? AND semester = ? AND tenant_id = ?
		`).bind(userId, classId, semester, this.tenantId).first<any>();

		if (!rapor) return;

		// Delete audit logs
		await this.db.prepare(`
			DELETE FROM rapor_audit_log WHERE rapor_id = ?
		`).bind(rapor.id).run();

		// Delete rapor
		await this.db.prepare(`
			DELETE FROM rapor_k13 WHERE id = ? AND tenant_id = ?
		`).bind(rapor.id, this.tenantId).run();
	}

	/**
	 * Delete a rapor by ID and its audit logs.
	 */
	async deleteRaporById(raporId: string): Promise<void> {
		// Delete audit logs
		await this.db.prepare(`
			DELETE FROM rapor_audit_log WHERE rapor_id = ?
		`).bind(raporId).run();

		// Delete rapor
		await this.db.prepare(`
			DELETE FROM rapor_k13 WHERE id = ? AND tenant_id = ?
		`).bind(raporId, this.tenantId).run();
	}

	/**
	 * Map a raw DB row to a RaporDetail object (parse JSON fields).
	 */
	private mapRaporRow(row: any): RaporDetail {
		return {
			id: row.id,
			tenant_id: row.tenant_id,
			user_id: row.user_id,
			class_id: row.class_id,
			academic_period_id: row.academic_period_id,
			semester: row.semester,
			status: row.status,
			subject_grades: row.subject_grades ? JSON.parse(row.subject_grades) : [],
			attendance_sick: row.attendance_sick ?? 0,
			attendance_permit: row.attendance_permit ?? 0,
			attendance_absent: row.attendance_absent ?? 0,
			attitude_spiritual: row.attitude_spiritual,
			attitude_spiritual_desc: row.attitude_spiritual_desc,
			attitude_social: row.attitude_social,
			attitude_social_desc: row.attitude_social_desc,
			extracurriculars: row.extracurriculars ? JSON.parse(row.extracurriculars) : [],
			homeroom_notes: row.homeroom_notes,
			finalized_by: row.finalized_by,
			finalized_at: row.finalized_at,
			printed_count: row.printed_count ?? 0,
			printed_at: row.printed_at,
			created_at: row.created_at,
			updated_at: row.updated_at,
			display_name: row.display_name,
			nis: row.nis
		};
	}
}

import type { D1Database } from '@cloudflare/workers-types';
import { ExamParticipantsRepository, type ExamParticipant } from './participants.repository';

// ============================================================
// Conflicts — split from exam-scheduler.repository.ts
// ============================================================
export interface ExamConflict {
	id: string;
	tenant_id: string;
	exam_id_1: string;
	exam_id_2: string;
	conflict_type: string;
	conflict_detail: string;
	resolved: number;
	resolved_at: string | null;
	resolved_by: string | null;
	created_at?: string;
}

export interface ExamConflictDetail extends ExamConflict {
	exam_title_1?: string;
	exam_title_2?: string;
	exam_date_1?: string;
	exam_date_2?: string;
	exam_start_1?: string;
	exam_end_1?: string;
	exam_start_2?: string;
	exam_end_2?: string;
}

export class ExamConflictsRepository extends ExamParticipantsRepository {
	// ----------------------------------------------------------
	// EXAM CONFLICTS
	// ----------------------------------------------------------
	/** Get conflicts for an exam. Route alias: getConflicts(examId). */
	async getConflicts(examId: string): Promise<ExamConflictDetail[]> {
		return this.listConflicts({ exam_id: examId });
	}

	/** Detect room conflicts: same room double-booked at overlapping times. */
	async detectRoomConflicts(examDate: string, excludeExamId?: string): Promise<ExamConflictDetail[]> {
		const conditions = [
			`e1.tenant_id = ?`, `e2.tenant_id = ?`,
			`e1.exam_date = ?`, `e2.exam_date = ?`,
			`e1.room_id = e2.room_id`, `e1.id < e2.id`,
			`e1.start_time < e2.end_time`, `e2.start_time < e1.end_time`
		];
		const params: any[] = [this.tenantId, this.tenantId, examDate, examDate];
		if (excludeExamId) {
			conditions.push(`e1.id != ? AND e2.id != ?`);
			params.push(excludeExamId, excludeExamId);
		}
		const where = conditions.join(' AND ');
		const rows = await this.db
			.prepare(
				`SELECT e1.id AS exam_id_1, e2.id AS exam_id_2,
						e1.title AS exam_title_1, e2.title AS exam_title_2,
						e1.exam_date AS exam_date_1, e2.exam_date AS exam_date_2,
						e1.start_time AS exam_start_1, e1.end_time AS exam_end_1,
						e2.start_time AS exam_start_2, e2.end_time AS exam_end_2,
						er.name AS room_name, 'room_overlap' AS conflict_type
				FROM exams e1
				JOIN exams e2 ON ${where}
				LEFT JOIN exam_rooms er ON er.id = e1.room_id AND er.tenant_id = e1.tenant_id`
			)
			.bind(...params)
			.all<any>();
		return (rows.results || []).map((r) => ({
			id: '', tenant_id: this.tenantId,
			exam_id_1: r.exam_id_1, exam_id_2: r.exam_id_2,
			conflict_type: r.conflict_type,
			conflict_detail: `Room "${r.room_name}" double-booked: "${r.exam_title_1}" (${r.exam_start_1}-${r.exam_end_1}) vs "${r.exam_title_2}" (${r.exam_start_2}-${r.exam_end_2})`,
			resolved: 0, resolved_at: null, resolved_by: null,
			exam_title_1: r.exam_title_1, exam_title_2: r.exam_title_2,
			exam_date_1: r.exam_date_1, exam_date_2: r.exam_date_2,
			exam_start_1: r.exam_start_1, exam_end_1: r.exam_end_1,
			exam_start_2: r.exam_start_2, exam_end_2: r.exam_end_2
		}));
	}

	/** Detect teacher conflicts: same proctor at overlapping times. */
	async detectTeacherConflicts(examDate: string, excludeExamId?: string): Promise<ExamConflictDetail[]> {
		const conditions = [
			`e1.tenant_id = ?`, `e2.tenant_id = ?`,
			`e1.exam_date = ?`, `e2.exam_date = ?`,
			`e1.proctor_id = e2.proctor_id`, `e1.proctor_id IS NOT NULL`,
			`e1.id < e2.id`,
			`e1.start_time < e2.end_time`, `e2.start_time < e1.end_time`
		];
		const params: any[] = [this.tenantId, this.tenantId, examDate, examDate];
		if (excludeExamId) {
			conditions.push(`e1.id != ? AND e2.id != ?`);
			params.push(excludeExamId, excludeExamId);
		}
		const where = conditions.join(' AND ');
		const rows = await this.db
			.prepare(
				`SELECT e1.id AS exam_id_1, e2.id AS exam_id_2,
						e1.title AS exam_title_1, e2.title AS exam_title_2,
						e1.exam_date AS exam_date_1, e2.exam_date AS exam_date_2,
						e1.start_time AS exam_start_1, e1.end_time AS exam_end_1,
						e2.start_time AS exam_start_2, e2.end_time AS exam_end_2,
						u.display_name AS proctor_name, 'teacher_overlap' AS conflict_type
				FROM exams e1
				JOIN exams e2 ON ${where}
				LEFT JOIN users u ON u.id = e1.proctor_id`
			)
			.bind(...params)
			.all<any>();
		return (rows.results || []).map((r) => ({
			id: '', tenant_id: this.tenantId,
			exam_id_1: r.exam_id_1, exam_id_2: r.exam_id_2,
			conflict_type: r.conflict_type,
			conflict_detail: `Proctor "${r.proctor_name}" double-booked: "${r.exam_title_1}" (${r.exam_start_1}-${r.exam_end_1}) vs "${r.exam_title_2}" (${r.exam_start_2}-${r.exam_end_2})`,
			resolved: 0, resolved_at: null, resolved_by: null,
			exam_title_1: r.exam_title_1, exam_title_2: r.exam_title_2,
			exam_date_1: r.exam_date_1, exam_date_2: r.exam_date_2,
			exam_start_1: r.exam_start_1, exam_end_1: r.exam_end_1,
			exam_start_2: r.exam_start_2, exam_end_2: r.exam_end_2
		}));
	}

	/** Detect student conflicts: same student registered for overlapping exams. */
	async detectStudentConflicts(examDate: string, excludeExamId?: string): Promise<ExamConflictDetail[]> {
		const excludeClause = excludeExamId
			? `AND ep1.exam_id != '${excludeExamId}' AND ep2.exam_id != '${excludeExamId}'`
			: '';
		const rows = await this.db
			.prepare(
				`SELECT ep1.student_id,
						e1.id AS exam_id_1, e2.id AS exam_id_2,
						e1.title AS exam_title_1, e2.title AS exam_title_2,
						e1.exam_date AS exam_date_1, e2.exam_date AS exam_date_2,
						e1.start_time AS exam_start_1, e1.end_time AS exam_end_1,
						e2.start_time AS exam_start_2, e2.end_time AS exam_end_2,
						u.display_name AS student_name, 'student_overlap' AS conflict_type
				FROM exam_participants ep1
				JOIN exam_participants ep2 ON ep1.student_id = ep2.student_id AND ep1.exam_id < ep2.exam_id AND ep1.tenant_id = ep2.tenant_id
				JOIN exams e1 ON e1.id = ep1.exam_id AND e1.tenant_id = ep1.tenant_id
				JOIN exams e2 ON e2.id = ep2.exam_id AND e2.tenant_id = ep2.tenant_id
				LEFT JOIN users u ON u.id = ep1.student_id
				WHERE ep1.tenant_id = ? AND e1.exam_date = ? AND e2.exam_date = ?
					AND e1.start_time < e2.end_time AND e2.start_time < e1.end_time
					${excludeClause}
				ORDER BY ep1.student_id`
			)
			.bind(this.tenantId, examDate, examDate)
			.all<any>();
		return (rows.results || []).map((r) => ({
			id: '', tenant_id: this.tenantId,
			exam_id_1: r.exam_id_1, exam_id_2: r.exam_id_2,
			conflict_type: r.conflict_type,
			conflict_detail: `Student "${r.student_name}" overlapping exams: "${r.exam_title_1}" (${r.exam_start_1}-${r.exam_end_1}) vs "${r.exam_title_2}" (${r.exam_start_2}-${r.exam_end_2})`,
			resolved: 0, resolved_at: null, resolved_by: null,
			exam_title_1: r.exam_title_1, exam_title_2: r.exam_title_2,
			exam_date_1: r.exam_date_1, exam_date_2: r.exam_date_2,
			exam_start_1: r.exam_start_1, exam_end_1: r.exam_end_1,
			exam_start_2: r.exam_start_2, exam_end_2: r.exam_end_2
		}));
	}

	/** Detect all conflict types for a date. */
	async detectAllConflicts(examDate: string, excludeExamId?: string): Promise<ExamConflictDetail[]> {
		const [room, teacher, student] = await Promise.all([
			this.detectRoomConflicts(examDate, excludeExamId),
			this.detectTeacherConflicts(examDate, excludeExamId),
			this.detectStudentConflicts(examDate, excludeExamId)
		]);
		return [...room, ...teacher, ...student];
	}

	/** Persist conflicts, skipping duplicates. */
	async saveConflicts(conflicts: ExamConflictDetail[]): Promise<ExamConflict[]> {
		const saved: ExamConflict[] = [];
		for (const c of conflicts) {
			const existing = await this.db
				.prepare(
					`SELECT id FROM exam_conflicts
					 WHERE exam_id_1 = ? AND exam_id_2 = ? AND conflict_type = ? AND tenant_id = ?`
				)
				.bind(c.exam_id_1, c.exam_id_2, c.conflict_type, this.tenantId)
				.first<{ id: string }>();
			if (existing) continue;
			const id = crypto.randomUUID();
			const now = new Date().toISOString();
			await this.db
				.prepare(
					`INSERT INTO exam_conflicts (id, tenant_id, exam_id_1, exam_id_2, conflict_type, conflict_detail, resolved, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
				)
				.bind(id, this.tenantId, c.exam_id_1, c.exam_id_2, c.conflict_type, c.conflict_detail, now)
				.run();
			saved.push({ ...c, id, created_at: now });
		}
		return saved;
	}

	/** List conflicts with optional filters. */
	async listConflicts(options?: {
		conflict_type?: string;
		resolved?: boolean;
		exam_id?: string;
	}): Promise<ExamConflictDetail[]> {
		const conditions: string[] = [`ec.tenant_id = ?`];
		const params: any[] = [this.tenantId];
		if (options?.conflict_type) { conditions.push(`ec.conflict_type = ?`); params.push(options.conflict_type); }
		if (options?.resolved !== undefined) { conditions.push(`ec.resolved = ?`); params.push(options.resolved ? 1 : 0); }
		if (options?.exam_id) { conditions.push(`(ec.exam_id_1 = ? OR ec.exam_id_2 = ?)`); params.push(options.exam_id, options.exam_id); }
		const where = conditions.join(' AND ');
		const rows = await this.db
			.prepare(
				`SELECT ec.*,
						e1.title AS exam_title_1, e2.title AS exam_title_2,
						e1.exam_date AS exam_date_1, e2.exam_date AS exam_date_2,
						e1.start_time AS exam_start_1, e1.end_time AS exam_end_1,
						e2.start_time AS exam_start_2, e2.end_time AS exam_end_2
				 FROM exam_conflicts ec
				 LEFT JOIN exams e1 ON e1.id = ec.exam_id_1 AND e1.tenant_id = ec.tenant_id
				 LEFT JOIN exams e2 ON e2.id = ec.exam_id_2 AND e2.tenant_id = ec.tenant_id
				 WHERE ${where}
				 ORDER BY ec.created_at DESC`
			)
			.bind(...params)
			.all<ExamConflictDetail>();
		return rows.results || [];
	}

	async resolveConflict(conflictId: string, resolvedBy: string): Promise<boolean> {
		const now = new Date().toISOString();
		const result = await this.db
			.prepare(`UPDATE exam_conflicts SET resolved = 1, resolved_at = ?, resolved_by = ? WHERE id = ? AND tenant_id = ?`)
			.bind(now, resolvedBy, conflictId, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}

	async deleteConflict(id: string): Promise<boolean> {
		const result = await this.db
			.prepare(`DELETE FROM exam_conflicts WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

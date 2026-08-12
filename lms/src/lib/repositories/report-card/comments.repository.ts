import type { D1Database } from '@cloudflare/workers-types';
import { ReportCardSectionsRepository } from './sections.repository';
import type { TeacherComment, TeacherCommentInput, TeacherCommentUpdate } from './types.repository';

export class ReportCardCommentsRepository extends ReportCardSectionsRepository {
	async getComments(tenantId: string, options?: { studentId?: string; classSubjectId?: string; academicYear?: string; semester?: number }): Promise<any[]> {
		let sql = `SELECT tc.*, u.display_name AS student_name, s.name AS subject_name
			FROM teacher_comments tc
			LEFT JOIN users u ON u.id = tc.student_id
			LEFT JOIN class_subjects cs ON cs.id = tc.class_subject_id
			LEFT JOIN subjects s ON s.id = cs.subject_id
			WHERE tc.tenant_id = ?`;
		const params: any[] = [tenantId];

		if (options?.studentId) {
			sql += ` AND tc.student_id = ?`;
			params.push(options.studentId);
		}

		if (options?.classSubjectId) {
			sql += ` AND tc.class_subject_id = ?`;
			params.push(options.classSubjectId);
		}

		if (options?.academicYear) {
			sql += ` AND tc.academic_year = ?`;
			params.push(options.academicYear);
		}

		if (options?.semester !== undefined) {
			sql += ` AND tc.semester = ?`;
			params.push(options.semester);
		}

		sql += ` ORDER BY tc.created_at DESC`;

		const result = await this.db.prepare(sql).bind(...params).all<any>();
		return result.results || [];
	}
	async createComment(tenantId: string, data: TeacherCommentInput, createdBy: string): Promise<TeacherComment | null> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await this.db.prepare(`
			INSERT INTO teacher_comments (id, tenant_id, student_id, class_subject_id, academic_year, semester, comment, created_by, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			id,
			tenantId,
			data.studentId,
			data.classSubjectId,
			data.academicYear,
			data.semester,
			data.comment,
			createdBy,
			now,
			now
		).run();

		return this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ?`
		).bind(id).first<TeacherComment>();
	}
	async updateComment(id: string, tenantId: string, data: TeacherCommentUpdate): Promise<TeacherComment | null> {
		const existing = await this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ? AND tenant_id = ?`
		).bind(id, tenantId).first<TeacherComment>();

		if (!existing) return null;

		const now = new Date().toISOString();

		await this.db.prepare(`
			UPDATE teacher_comments SET comment = ?, updated_at = ?
			WHERE id = ? AND tenant_id = ?
		`).bind(data.comment, now, id, tenantId).run();

		return this.db.prepare(
			`SELECT * FROM teacher_comments WHERE id = ?`
		).bind(id).first<TeacherComment>();
	}
}

import type { D1Database } from '@cloudflare/workers-types';
import { ExamAssignmentsRepository, type ExamRoomAssignment } from './assignments.repository';

// ============================================================
// Participants — split from exam-scheduler.repository.ts
// ============================================================
export interface ExamParticipant {
	id: string;
	tenant_id: string;
	exam_id: string;
	student_id: string;
	room_id: string | null;
	seat_number: string | null;
	status: string;
	score: number | null;
	notes: string | null;
	created_at?: string;
	updated_at?: string;
	// joined fields
	student_name?: string;
	student_nis?: string;
}

export class ExamParticipantsRepository extends ExamAssignmentsRepository {
	// ----------------------------------------------------------
	// EXAM PARTICIPANTS
	// ----------------------------------------------------------
	/** List participants for an exam. */
	async getExamParticipants(examId: string): Promise<ExamParticipant[]> {
		const rows = await this.db
			.prepare(
				`SELECT ep.*,
						u.display_name AS student_name,
						cm.nis AS student_nis
				 FROM exam_participants ep
				 LEFT JOIN users u ON u.id = ep.student_id
				 LEFT JOIN class_members cm ON cm.user_id = ep.student_id
				 WHERE ep.exam_id = ? AND ep.tenant_id = ?
				 ORDER BY cm.nis, u.display_name`
			)
			.bind(examId, this.tenantId)
			.all<ExamParticipant>();
		return rows.results || [];
	}

	async listExamParticipants(examId: string): Promise<ExamParticipant[]> {
		return this.getExamParticipants(examId);
	}

	async getExamParticipant(examId: string, studentId: string): Promise<ExamParticipant | null> {
		const row = await this.db
			.prepare(
				`SELECT ep.*,
						u.display_name AS student_name,
						cm.nis AS student_nis
				 FROM exam_participants ep
				 LEFT JOIN users u ON u.id = ep.student_id
				 LEFT JOIN class_members cm ON cm.user_id = ep.student_id
				 WHERE ep.exam_id = ? AND ep.student_id = ? AND ep.tenant_id = ?`
			)
			.bind(examId, studentId, this.tenantId)
			.first<ExamParticipant>();
		return row || null;
	}

	/**
	 * Add participant. Accepts `user_id` (mapped to `student_id`) for route compat.
	 */
	async addExamParticipant(data: {
		exam_id: string;
		user_id?: string;
		student_id?: string;
		room_id?: string;
		seat_number?: string;
		status?: string;
		score?: number;
		notes?: string;
	}): Promise<ExamParticipant> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exam_participants (id, tenant_id, exam_id, student_id, room_id, seat_number, status, score, notes, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.exam_id,
				data.student_id || data.user_id || '',
				data.room_id || null,
				data.seat_number || null,
				data.status || 'registered',
				data.score ?? null,
				data.notes || null,
				now,
				now
			)
			.run();
		return (await this.db
			.prepare(`SELECT * FROM exam_participants WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<ExamParticipant>())!;
	}

	async addExamParticipantsBatch(examId: string, studentIds: string[], roomId?: string): Promise<void> {
		const now = new Date().toISOString();
		const stmts = studentIds.map((studentId) => {
			const id = crypto.randomUUID();
			return this.db
				.prepare(
					`INSERT INTO exam_participants (id, tenant_id, exam_id, student_id, room_id, status, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, 'registered', ?, ?)`
				)
				.bind(id, this.tenantId, examId, studentId, roomId || null, now, now);
		});
		if (stmts.length > 0) await this.db.batch(stmts);
	}

	async updateExamParticipant(
		id: string,
		data: Partial<Omit<ExamParticipant, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
	): Promise<ExamParticipant | null> {
		const fields: string[] = [];
		const values: any[] = [];
		for (const [key, val] of Object.entries(data)) {
			fields.push(`${key} = ?`);
			values.push(val ?? null);
		}
		if (fields.length === 0) return null;
		fields.push('updated_at = ?');
		values.push(new Date().toISOString());
		values.push(id, this.tenantId);
		await this.db
			.prepare(`UPDATE exam_participants SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`)
			.bind(...values)
			.run();
		return this.db
			.prepare(`SELECT * FROM exam_participants WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<ExamParticipant>() || null;
	}

	async removeExamParticipant(id: string): Promise<boolean> {
		const result = await this.db
			.prepare(`DELETE FROM exam_participants WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

import type { D1Database } from '@cloudflare/workers-types';
import { ExamExamsRepository, type Exam, type ExamRoom } from './exams.repository';

// ============================================================
// Room Assignments — split from exam-scheduler.repository.ts
// ============================================================
export interface ExamRoomAssignment {
	id: string;
	tenant_id: string;
	exam_id: string;
	room_id: string;
	capacity_override: number | null;
	notes: string | null;
	created_at?: string;
}

export class ExamAssignmentsRepository extends ExamExamsRepository {
	// ----------------------------------------------------------
	// EXAM ROOM ASSIGNMENTS
	// ----------------------------------------------------------
	/** Create room. Route calls this as createExamRoom. */
	async createExamRoom(data: {
		name: string;
		code: string;
		capacity: number;
		building?: string;
		floor?: string;
		facilities?: string;
		is_active?: number;
	}): Promise<ExamRoom> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exam_rooms (id, tenant_id, name, code, capacity, building, floor, facilities, is_active, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id, this.tenantId, data.name, data.code, data.capacity,
				data.building || null, data.floor || null, data.facilities || null,
				data.is_active ?? 1, now, now
			)
			.run();
		return (await this.getExamRoom(id))!;
	}

	async listExamRoomAssignments(examId: string): Promise<ExamRoomAssignment[]> {
		const rows = await this.db
			.prepare(
				`SELECT era.*, er.name AS room_name, er.code AS room_code, er.capacity
				 FROM exam_room_assignments era
				 LEFT JOIN exam_rooms er ON er.id = era.room_id AND er.tenant_id = era.tenant_id
				 WHERE era.exam_id = ? AND era.tenant_id = ?
				 ORDER BY er.name`
			)
			.bind(examId, this.tenantId)
			.all<ExamRoomAssignment>();
		return rows.results || [];
	}

	async createExamRoomAssignment(
		data: Omit<ExamRoomAssignment, 'id' | 'tenant_id' | 'created_at'>
	): Promise<ExamRoomAssignment> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exam_room_assignments (id, tenant_id, exam_id, room_id, capacity_override, notes, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(id, this.tenantId, data.exam_id, data.room_id, data.capacity_override ?? null, data.notes || null, now)
			.run();
		return (await this.db
			.prepare(`SELECT * FROM exam_room_assignments WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<ExamRoomAssignment>())!;
	}

	async deleteExamRoomAssignment(id: string): Promise<boolean> {
		const result = await this.db
			.prepare(`DELETE FROM exam_room_assignments WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

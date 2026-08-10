import type { D1Database } from '@cloudflare/workers-types';
import { ExamRoomsRepository, type ExamRoom } from './rooms.repository';
export type { ExamRoom } from './rooms.repository';

// ============================================================
// Exams — split from exam-scheduler.repository.ts
// ============================================================
export interface Exam {
	id: string;
	tenant_id: string;
	exam_type_id: string;
	subject_id: string | null;
	class_id: string | null;
	title: string;
	description: string | null;
	exam_date: string;
	start_time: string;
	end_time: string;
	room_id: string;
	proctor_id: string | null;
	max_participants: number | null;
	status: string;
	notes: string | null;
	created_by?: string | null;
	created_at?: string;
	updated_at?: string;
	// joined fields
	exam_type_name?: string;
	exam_type_code?: string;
	room_name?: string;
	room_code?: string;
	subject_name?: string;
	class_name?: string;
	proctor_name?: string;
}

export class ExamExamsRepository extends ExamRoomsRepository {
	// ----------------------------------------------------------
	// EXAMS
	// ----------------------------------------------------------
	/** Public alias for routes. */
	async getExams(filters?: {
		exam_type_id?: string;
		subject_id?: string;
		class_id?: string;
		status?: string;
		room_id?: string;
		exam_date?: string;
		exam_date_from?: string;
		exam_date_to?: string;
	}): Promise<Exam[]> {
		return this.listExamsImpl(filters);
	}

	/** List exams with filters. */
	async listExams(filters?: {
		exam_type_id?: string;
		subject_id?: string;
		class_id?: string;
		status?: string;
		room_id?: string;
		exam_date?: string;
		exam_date_from?: string;
		exam_date_to?: string;
	}): Promise<Exam[]> {
		return this.listExamsImpl(filters);
	}

	private async listExamsImpl(filters?: {
		exam_type_id?: string;
		subject_id?: string;
		class_id?: string;
		status?: string;
		room_id?: string;
		exam_date?: string;
		exam_date_from?: string;
		exam_date_to?: string;
	}): Promise<Exam[]> {
		const conditions: string[] = [`e.tenant_id = ?`];
		const params: any[] = [this.tenantId];

		if (filters?.exam_type_id) {
			conditions.push(`e.exam_type_id = ?`);
			params.push(filters.exam_type_id);
		}
		if (filters?.subject_id) {
			conditions.push(`e.subject_id = ?`);
			params.push(filters.subject_id);
		}
		if (filters?.class_id) {
			conditions.push(`e.class_id = ?`);
			params.push(filters.class_id);
		}
		if (filters?.status) {
			conditions.push(`e.status = ?`);
			params.push(filters.status);
		}
		if (filters?.room_id) {
			conditions.push(`e.room_id = ?`);
			params.push(filters.room_id);
		}
		if (filters?.exam_date) {
			conditions.push(`e.exam_date = ?`);
			params.push(filters.exam_date);
		}
		if (filters?.exam_date_from) {
			conditions.push(`e.exam_date >= ?`);
			params.push(filters.exam_date_from);
		}
		if (filters?.exam_date_to) {
			conditions.push(`e.exam_date <= ?`);
			params.push(filters.exam_date_to);
		}

		const where = conditions.join(' AND ');
		const rows = await this.db
			.prepare(
				`SELECT e.*,
						et.name AS exam_type_name, et.code AS exam_type_code,
						er.name AS room_name, er.code AS room_code,
						s.name AS subject_name,
						c.name AS class_name,
						u.display_name AS proctor_name
				FROM exams e
				LEFT JOIN exam_types et ON et.id = e.exam_type_id AND et.tenant_id = e.tenant_id
				LEFT JOIN exam_rooms er ON er.id = e.room_id AND er.tenant_id = e.tenant_id
				LEFT JOIN subjects s ON s.id = e.subject_id
				LEFT JOIN classes c ON c.id = e.class_id
				LEFT JOIN users u ON u.id = e.proctor_id
				WHERE ${where}
				ORDER BY e.exam_date DESC, e.start_time ASC`
			)
			.bind(...params)
			.all<Exam>();
		return rows.results || [];
	}

	async getExam(id: string): Promise<Exam | null> {
		const row = await this.db
			.prepare(
				`SELECT e.*,
						et.name AS exam_type_name, et.code AS exam_type_code,
						er.name AS room_name, er.code AS room_code,
						s.name AS subject_name,
						c.name AS class_name,
						u.display_name AS proctor_name
				FROM exams e
				LEFT JOIN exam_types et ON et.id = e.exam_type_id AND et.tenant_id = e.tenant_id
				LEFT JOIN exam_rooms er ON er.id = e.room_id AND er.tenant_id = e.tenant_id
				LEFT JOIN subjects s ON s.id = e.subject_id
				LEFT JOIN classes c ON c.id = e.class_id
				LEFT JOIN users u ON u.id = e.proctor_id
				WHERE e.id = ? AND e.tenant_id = ?`
			)
			.bind(id, this.tenantId)
			.first<Exam>();
		return row || null;
	}

	/**
	 * Create exam. Accepts `name` (mapped to DB column `title`).
	 * Routes pass: { exam_type_id, room_id, name, description, exam_date, start_time, end_time, status, created_by }
	 */
	async createExam(data: {
		exam_type_id: string;
		room_id: string;
		name?: string;
		title?: string;
		description?: string;
		exam_date: string;
		start_time: string;
		end_time: string;
		status?: string;
		subject_id?: string;
		class_id?: string;
		proctor_id?: string;
		max_participants?: number;
		notes?: string;
		created_by?: string;
	}): Promise<Exam> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exams (id, tenant_id, exam_type_id, subject_id, class_id, title, description, exam_date, start_time, end_time, room_id, proctor_id, max_participants, status, notes, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.exam_type_id,
				data.subject_id || null,
				data.class_id || null,
				data.title || data.name || '',
				data.description || null,
				data.exam_date,
				data.start_time,
				data.end_time,
				data.room_id,
				data.proctor_id || null,
				data.max_participants ?? null,
				data.status || 'draft',
				data.notes || null,
				data.created_by || null,
				now,
				now
			)
			.run();
		return (await this.getExam(id))!;
	}

	/**
	 * Update exam. Accepts `name` (mapped to DB column `title`).
	 */
	async updateExam(
		id: string,
		data: Record<string, any>
	): Promise<Exam | null> {
		const allowed = [
			'exam_type_id', 'room_id', 'title', 'name', 'description',
			'exam_date', 'start_time', 'end_time', 'status',
			'subject_id', 'class_id', 'proctor_id', 'max_participants', 'notes'
		];
		const fields: string[] = [];
		const values: any[] = [];
		for (const [key, val] of Object.entries(data)) {
			if (!allowed.includes(key)) continue;
			const col = key === 'name' ? 'title' : key;
			fields.push(`${col} = ?`);
			values.push(val ?? null);
		}
		if (fields.length === 0) return this.getExam(id);
		fields.push('updated_at = ?');
		values.push(new Date().toISOString());
		values.push(id, this.tenantId);
		await this.db
			.prepare(
				`UPDATE exams SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
			)
			.bind(...values)
			.run();
		return this.getExam(id);
	}

	async deleteExam(id: string): Promise<boolean> {
		await this.db
			.prepare(`DELETE FROM exam_participants WHERE exam_id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		await this.db
			.prepare(`DELETE FROM exam_room_assignments WHERE exam_id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		await this.db
			.prepare(`DELETE FROM exam_conflicts WHERE (exam_id_1 = ? OR exam_id_2 = ?) AND tenant_id = ?`)
			.bind(id, id, this.tenantId)
			.run();
		const result = await this.db
			.prepare(`DELETE FROM exams WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

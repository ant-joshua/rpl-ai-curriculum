import type { D1Database } from '@cloudflare/workers-types';

// ============================================================
// Interfaces
// ============================================================

export interface ExamType {
	id: string;
	tenant_id: string;
	name: string;
	code: string;
	description: string | null;
	weight?: number;
	duration_minutes?: number;
	max_score?: number;
	passing_score?: number;
	is_online?: number;
	created_at?: string;
	updated_at?: string;
}

export interface ExamRoom {
	id: string;
	tenant_id: string;
	name: string;
	code: string;
	capacity: number;
	building: string | null;
	floor: string | null;
	facilities: string | null;
	is_active: number;
	created_at?: string;
	updated_at?: string;
}

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

export interface ExamRoomAssignment {
	id: string;
	tenant_id: string;
	exam_id: string;
	room_id: string;
	capacity_override: number | null;
	notes: string | null;
	created_at?: string;
}

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

// ============================================================
// Repository
// ============================================================

export class ExamSchedulerRepository {
	private db: D1Database;
	private tenantId: string;

	constructor(db: D1Database, tenantId: string = 'default') {
		this.db = db;
		this.tenantId = tenantId;
	}

	// ----------------------------------------------------------
	// EXAM TYPES
	// ----------------------------------------------------------

	/** List all exam types for this tenant. */
	async listExamTypes(): Promise<ExamType[]> {
		const rows = await this.db
			.prepare(`SELECT * FROM exam_types WHERE tenant_id = ? ORDER BY name`)
			.bind(this.tenantId)
			.all<ExamType>();
		return rows.results || [];
	}

	async getExamTypes(): Promise<ExamType[]> {
		return this.listExamTypes();
	}

	async getExamType(id: string): Promise<ExamType | null> {
		const row = await this.db
			.prepare(`SELECT * FROM exam_types WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<ExamType>();
		return row || null;
	}

	async createExamType(data: {
		name: string;
		code: string;
		description?: string;
		weight?: number;
		duration_minutes?: number;
		max_score?: number;
		passing_score?: number;
		is_online?: boolean;
	}): Promise<ExamType> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exam_types (id, tenant_id, name, code, description, weight, duration_minutes, max_score, passing_score, is_online, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.name,
				data.code,
				data.description || null,
				data.weight ?? 0,
				data.duration_minutes ?? null,
				data.max_score ?? null,
				data.passing_score ?? null,
				data.is_online ? 1 : 0,
				now,
				now
			)
			.run();
		return (await this.getExamType(id))!;
	}

	async updateExamType(
		id: string,
		data: Partial<Omit<ExamType, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
	): Promise<ExamType | null> {
		const allowed = [
			'name', 'code', 'description', 'weight',
			'duration_minutes', 'max_score', 'passing_score', 'is_online'
		];
		const fields: string[] = [];
		const values: any[] = [];
		for (const [key, val] of Object.entries(data)) {
			if (!allowed.includes(key)) continue;
			fields.push(`${key} = ?`);
			values.push(val ?? null);
		}
		if (fields.length === 0) return this.getExamType(id);
		fields.push('updated_at = ?');
		values.push(new Date().toISOString());
		values.push(id, this.tenantId);
		await this.db
			.prepare(
				`UPDATE exam_types SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
			)
			.bind(...values)
			.run();
		return this.getExamType(id);
	}

	async deleteExamType(id: string): Promise<boolean> {
		const result = await this.db
			.prepare(`DELETE FROM exam_types WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}

	// ----------------------------------------------------------
	// EXAM ROOMS
	// ----------------------------------------------------------

	/** List rooms for this tenant. */
	async listExamRooms(activeOnly: boolean = false): Promise<ExamRoom[]> {
		let query = `SELECT * FROM exam_rooms WHERE tenant_id = ?`;
		if (activeOnly) query += ` AND is_active = 1`;
		query += ` ORDER BY name`;
		const rows = await this.db
			.prepare(query)
			.bind(this.tenantId)
			.all<ExamRoom>();
		return rows.results || [];
	}

	async getRooms(activeOnly: boolean = false): Promise<ExamRoom[]> {
		return this.listExamRooms(activeOnly);
	}

	async getExamRoom(id: string): Promise<ExamRoom | null> {
		const row = await this.db
			.prepare(`SELECT * FROM exam_rooms WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.first<ExamRoom>();
		return row || null;
	}

	/** Create room. Accepts `location` (mapped to building) from route. */
	async createRoom(data: {
		name: string;
		code?: string;
		capacity: number;
		location?: string;
		facilities?: string;
		building?: string;
		floor?: string;
	}): Promise<ExamRoom> {
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await this.db
			.prepare(
				`INSERT INTO exam_rooms (id, tenant_id, name, code, capacity, building, floor, facilities, is_active, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
			)
			.bind(
				id,
				this.tenantId,
				data.name,
				data.code || null,
				data.capacity,
				data.building || data.location || null,
				data.floor || null,
				data.facilities || null,
				now,
				now
			)
			.run();
		return (await this.getExamRoom(id))!;
	}

	async updateExamRoom(
		id: string,
		data: Partial<Omit<ExamRoom, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
	): Promise<ExamRoom | null> {
		const allowed = ['name', 'code', 'capacity', 'building', 'floor', 'facilities', 'is_active'];
		const fields: string[] = [];
		const values: any[] = [];
		for (const [key, val] of Object.entries(data)) {
			if (!allowed.includes(key)) continue;
			fields.push(`${key} = ?`);
			values.push(val ?? null);
		}
		if (fields.length === 0) return this.getExamRoom(id);
		fields.push('updated_at = ?');
		values.push(new Date().toISOString());
		values.push(id, this.tenantId);
		await this.db
			.prepare(
				`UPDATE exam_rooms SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`
			)
			.bind(...values)
			.run();
		return this.getExamRoom(id);
	}

	async deleteExamRoom(id: string): Promise<boolean> {
		const result = await this.db
			.prepare(`DELETE FROM exam_rooms WHERE id = ? AND tenant_id = ?`)
			.bind(id, this.tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}

	// ----------------------------------------------------------
	// EXAMS
	// ----------------------------------------------------------

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

	async getExams(filters?: {
		exam_type_id?: string;
		subject_id?: string;
		class_id?: string;
		status?: string;
		room_id?: string;
		date_from?: string;
		date_to?: string;
		exam_date?: string;
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
		if (filters?.date_from) {
			conditions.push(`e.exam_date >= ?`);
			params.push(filters.date_from);
		}
		if (filters?.date_to) {
			conditions.push(`e.exam_date <= ?`);
			params.push(filters.date_to);
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

	// ----------------------------------------------------------
	// EXAM ROOM ASSIGNMENTS / createExamRoom alias
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

	// ----------------------------------------------------------
	// EXAM PARTICIPANTS
	// ----------------------------------------------------------

	/** List participants for an exam. */
	async listExamParticipants(examId: string): Promise<ExamParticipant[]> {
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

	// ----------------------------------------------------------
	// STATS
	// ----------------------------------------------------------

	async getExamStats(): Promise<{
		total: number; draft: number; published: number;
		in_progress: number; completed: number; cancelled: number;
		total_participants: number; unresolved_conflicts: number;
	}> {
		const examCounts = await this.db
			.prepare(`SELECT status, COUNT(*) AS count FROM exams WHERE tenant_id = ? GROUP BY status`)
			.bind(this.tenantId)
			.all<{ status: string; count: number }>();
		const counts: Record<string, number> = {};
		let total = 0;
		for (const row of examCounts.results || []) { counts[row.status] = row.count; total += row.count; }
		const participants = await this.db
			.prepare(`SELECT COUNT(*) AS count FROM exam_participants WHERE tenant_id = ?`)
			.bind(this.tenantId).first<{ count: number }>();
		const conflicts = await this.db
			.prepare(`SELECT COUNT(*) AS count FROM exam_conflicts WHERE tenant_id = ? AND resolved = 0`)
			.bind(this.tenantId).first<{ count: number }>();
		return {
			total, draft: counts['draft'] || 0, published: counts['published'] || 0,
			in_progress: counts['in_progress'] || 0, completed: counts['completed'] || 0,
			cancelled: counts['cancelled'] || 0,
			total_participants: participants?.count || 0, unresolved_conflicts: conflicts?.count || 0
		};
	}
}

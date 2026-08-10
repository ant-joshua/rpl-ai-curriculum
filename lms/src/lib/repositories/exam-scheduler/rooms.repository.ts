import type { D1Database } from '@cloudflare/workers-types';
import { ExamTypesRepository, type ExamType } from './types.repository';

// ============================================================
// Exam Rooms — split from exam-scheduler.repository.ts
// ============================================================
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

export class ExamRoomsRepository extends ExamTypesRepository {
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
				id,
				this.tenantId,
				data.name,
				data.code || null,
				data.capacity,
				data.building || null,
				data.floor || null,
				data.facilities || null,
				data.is_active ?? 1,
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
}

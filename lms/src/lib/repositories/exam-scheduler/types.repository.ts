import type { D1Database } from '@cloudflare/workers-types';

// ============================================================
// Exam Types — split from exam-scheduler.repository.ts
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

export class ExamTypesRepository {
	protected db: D1Database;
	protected tenantId: string;

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
}

import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Fee Structures — split from payment-gateway.repository.ts
// ============================================================
export interface FeeStructure {
	id: string;
	tenant_id: string;
	name: string;
	code: string | null;
	description: string | null;
	amount: number;
	fee_type: string;
	academic_year: string | null;
	semester: string | null;
	is_active: number;
	created_at?: string;
}

export class FeeStructuresRepository {
	// ----------------------------------------------------------
	// Fee Structures
	// ----------------------------------------------------------
	static async getFeeStructures(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		filters?: { fee_type?: string; academic_year?: string; is_active?: number }
	): Promise<FeeStructure[]> {
		const db = getDB(platform);
		const conditions = ['tenant_id = ?'];
		const binds: unknown[] = [tenantId];

		if (filters?.fee_type) {
			conditions.push('fee_type = ?');
			binds.push(filters.fee_type);
		}
		if (filters?.academic_year) {
			conditions.push('academic_year = ?');
			binds.push(filters.academic_year);
		}
		if (filters?.is_active !== undefined) {
			conditions.push('is_active = ?');
			binds.push(filters.is_active);
		}

		const where = conditions.join(' AND ');
		const rows = await db
			.prepare(`SELECT * FROM fee_structures WHERE ${where} ORDER BY created_at DESC`)
			.bind(...binds)
			.all<FeeStructure>();
		return rows.results || [];
	}

	static async createFeeStructure(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			name: string;
			code?: string;
			description?: string;
			amount: number;
			fee_type: string;
			academic_year?: string;
			semester?: string;
			is_active?: number;
		}
	): Promise<FeeStructure> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db
			.prepare(
				`INSERT INTO fee_structures (id, tenant_id, name, code, description, amount, fee_type, academic_year, semester, is_active, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				tenantId,
				data.name,
				data.code ?? null,
				data.description ?? null,
				data.amount,
				data.fee_type,
				data.academic_year ?? null,
				data.semester ?? null,
				data.is_active ?? 1,
				now
			)
			.run();
		const row = await db
			.prepare('SELECT * FROM fee_structures WHERE id = ?')
			.bind(id)
			.first<FeeStructure>();
		return row!;
	}

	static async updateFeeStructure(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		data: Partial<{
			name: string;
			code: string;
			description: string;
			amount: number;
			fee_type: string;
			academic_year: string;
			semester: string;
			is_active: number;
		}>
	): Promise<FeeStructure | null> {
		const db = getDB(platform);
		const existing = await db
			.prepare('SELECT * FROM fee_structures WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<FeeStructure>();
		if (!existing) return null;

		const fields: string[] = [];
		const values: unknown[] = [];
		if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
		if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
		if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
		if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
		if (data.fee_type !== undefined) { fields.push('fee_type = ?'); values.push(data.fee_type); }
		if (data.academic_year !== undefined) { fields.push('academic_year = ?'); values.push(data.academic_year); }
		if (data.semester !== undefined) { fields.push('semester = ?'); values.push(data.semester); }
		if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }

		if (fields.length === 0) return existing;

		values.push(id, tenantId);
		await db
			.prepare(`UPDATE fee_structures SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`)
			.bind(...values)
			.run();

		return await db
			.prepare('SELECT * FROM fee_structures WHERE id = ?')
			.bind(id)
			.first<FeeStructure>();
	}

	static async deleteFeeStructure(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<boolean> {
		const db = getDB(platform);
		const result = await db
			.prepare('DELETE FROM fee_structures WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

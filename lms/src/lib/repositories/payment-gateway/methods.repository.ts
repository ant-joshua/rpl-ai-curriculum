import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Payment Methods — split from payment-gateway.repository.ts
// ============================================================
export interface PaymentMethod {
	id: string;
	tenant_id: string;
	name: string;
	code: string;
	provider: string;
	is_active: number;
	config_json: string | null;
	created_at?: string;
}

export class PaymentMethodsRepository {
	// ----------------------------------------------------------
	// Payment Methods
	// ----------------------------------------------------------
	static async getPaymentMethods(
		platform: { env: { DB: D1Database } },
		tenantId: string
	): Promise<PaymentMethod[]> {
		const db = getDB(platform);
		const rows = await db
			.prepare('SELECT * FROM payment_methods WHERE tenant_id = ? ORDER BY created_at DESC')
			.bind(tenantId)
			.all<PaymentMethod>();
		return rows.results || [];
	}

	static async createPaymentMethod(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			name: string;
			code: string;
			provider: string;
			is_active?: number;
			config_json?: string;
		}
	): Promise<PaymentMethod> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db
			.prepare(
				`INSERT INTO payment_methods (id, tenant_id, name, code, provider, is_active, config_json, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				tenantId,
				data.name,
				data.code,
				data.provider,
				data.is_active ?? 1,
				data.config_json ?? null,
				now
			)
			.run();
		const row = await db
			.prepare('SELECT * FROM payment_methods WHERE id = ?')
			.bind(id)
			.first<PaymentMethod>();
		return row!;
	}

	static async updatePaymentMethod(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		data: Partial<{
			name: string;
			code: string;
			provider: string;
			is_active: number;
			config_json: string;
		}>
	): Promise<PaymentMethod | null> {
		const db = getDB(platform);
		const existing = await db
			.prepare('SELECT * FROM payment_methods WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<PaymentMethod>();
		if (!existing) return null;

		const fields: string[] = [];
		const values: unknown[] = [];
		if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
		if (data.code !== undefined) { fields.push('code = ?'); values.push(data.code); }
		if (data.provider !== undefined) { fields.push('provider = ?'); values.push(data.provider); }
		if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
		if (data.config_json !== undefined) { fields.push('config_json = ?'); values.push(data.config_json); }

		if (fields.length === 0) return existing;

		values.push(id, tenantId);
		await db
			.prepare(`UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`)
			.bind(...values)
			.run();

		return await db
			.prepare('SELECT * FROM payment_methods WHERE id = ?')
			.bind(id)
			.first<PaymentMethod>();
	}
}

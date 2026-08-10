import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Refunds — split from payment-gateway.repository.ts
// ============================================================
export interface Refund {
	id: string;
	tenant_id: string;
	payment_id: string;
	amount: number;
	reason: string | null;
	status: string;
	requested_by: string | null;
	approved_by: string | null;
	processed_at: string | null;
	created_at?: string;
	// joined
	student_name?: string;
	payment_amount?: number;
}

export interface PaymentCallback {
	id: string;
	tenant_id: string;
	payment_id: string | null;
	provider: string;
	payload: string;
	processed: number;
	processed_at: string | null;
	created_at?: string;
}

export class RefundsRepository {
	// ----------------------------------------------------------
	// Refunds
	// ----------------------------------------------------------
	static async createRefund(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			payment_id: string;
			amount: number;
			reason?: string;
			requested_by?: string;
		}
	): Promise<Refund> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO refunds (id, tenant_id, payment_id, amount, reason, status, requested_by, created_at)
				 VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
			)
			.bind(
				id,
				tenantId,
				data.payment_id,
				data.amount,
				data.reason ?? null,
				data.requested_by ?? null,
				now
			)
			.run();

		const row = await db
			.prepare(
				`SELECT r.*, st.display_name as student_name, p.amount as payment_amount
				 FROM refunds r
				 LEFT JOIN payments p ON r.payment_id = p.id
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = r.tenant_id
				 WHERE r.id = ?`
			)
			.bind(id)
			.first<Refund>();
		return row!;
	}

	static async listRefunds(
		platform: { env: { DB: D1Database } },
		tenantId: string
	): Promise<Refund[]> {
		const db = getDB(platform);
		const rows = await db
			.prepare(
				`SELECT r.*, st.display_name as student_name, p.amount as payment_amount
				 FROM refunds r
				 LEFT JOIN payments p ON r.payment_id = p.id
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = r.tenant_id
				 WHERE r.tenant_id = ?
				 ORDER BY r.created_at DESC`
			)
			.bind(tenantId)
			.all<Refund>();
		return rows.results || [];
	}
}

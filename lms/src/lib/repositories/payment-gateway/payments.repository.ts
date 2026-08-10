import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Payments — split from payment-gateway.repository.ts
// ============================================================
export interface Payment {
	id: string;
	tenant_id: string;
	invoice_id: string;
	student_id: string;
	payment_method_id: string | null;
	amount: number;
	payment_date: string;
	payment_type: string;
	reference_number: string | null;
	gateway_transaction_id: string | null;
	status: string;
	verified_by: string | null;
	verified_at: string | null;
	notes: string | null;
	created_at?: string;
	// joined
	student_name?: string;
	payment_method_name?: string;
	invoice_number?: string;
}

export class PaymentsRepository {
	// ----------------------------------------------------------
	// Payments
	// ----------------------------------------------------------
	static async createPayment(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			invoice_id: string;
			student_id: string;
			amount: number;
			payment_method_id?: string;
			payment_date: string;
			payment_type?: string;
			reference_number?: string;
			notes?: string;
		}
	): Promise<Payment> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO payments (id, tenant_id, invoice_id, student_id, payment_method_id, amount, payment_date, payment_type, reference_number, status, notes, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
			)
			.bind(
				id,
				tenantId,
				data.invoice_id,
				data.student_id,
				data.payment_method_id ?? null,
				data.amount,
				data.payment_date,
				data.payment_type ?? 'transfer',
				data.reference_number ?? null,
				data.notes ?? null,
				now
			)
			.run();

		const row = await db
			.prepare(
				`SELECT p.*, pm.name as payment_method_name, i.invoice_number
				 FROM payments p
				 LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
				 LEFT JOIN invoices i ON p.invoice_id = i.id
				 WHERE p.id = ?`
			)
			.bind(id)
			.first<Payment>();
		return row!;
	}

	static async listPayments(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		filters?: {
			status?: string;
			invoiceId?: string;
			studentId?: string;
			page?: number;
			limit?: number;
		}
	): Promise<{ payments: Payment[]; total: number; page: number; limit: number; totalPages: number }> {
		const db = getDB(platform);
		const page = filters?.page || 1;
		const limit = Math.min(filters?.limit || 20, 100);
		const offset = (page - 1) * limit;

		const conditions = ['p.tenant_id = ?'];
		const binds: unknown[] = [tenantId];

		if (filters?.status) {
			conditions.push('p.status = ?');
			binds.push(filters.status);
		}
		if (filters?.invoiceId) {
			conditions.push('p.invoice_id = ?');
			binds.push(filters.invoiceId);
		}
		if (filters?.studentId) {
			conditions.push('p.student_id = ?');
			binds.push(filters.studentId);
		}

		const where = conditions.join(' AND ');

		const countResult = await db
			.prepare(`SELECT COUNT(*) as cnt FROM payments p WHERE ${where}`)
			.bind(...binds)
			.first<{ cnt: number }>();
		const total = countResult?.cnt ?? 0;

		const rows = await db
			.prepare(
				`SELECT p.*, st.display_name as student_name, pm.name as payment_method_name, i.invoice_number
				 FROM payments p
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = p.tenant_id
				 LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
				 LEFT JOIN invoices i ON p.invoice_id = i.id
				 WHERE ${where}
				 ORDER BY p.created_at DESC
				 LIMIT ? OFFSET ?`
			)
			.bind(...binds, limit, offset)
			.all<Payment>();

		return {
			payments: rows.results || [],
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	}

	static async verifyPayment(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		verifiedBy: string
	): Promise<Payment | null> {
		const db = getDB(platform);
		const payment = await db
			.prepare('SELECT * FROM payments WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<Payment>();
		if (!payment) return null;

		const now = new Date().toISOString();

		await db
			.prepare(
				`UPDATE payments SET status = 'verified', verified_by = ?, verified_at = ? WHERE id = ? AND tenant_id = ?`
			)
			.bind(verifiedBy, now, id, tenantId)
			.run();

		// Update invoice status based on total paid
		await this._recalculateInvoiceStatus(db, payment.invoice_id);

		return await db
			.prepare(
				`SELECT p.*, st.display_name as student_name, pm.name as payment_method_name, i.invoice_number
				 FROM payments p
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = p.tenant_id
				 LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
				 LEFT JOIN invoices i ON p.invoice_id = i.id
				 WHERE p.id = ?`
			)
			.bind(id)
			.first<Payment>();
	}

	static async rejectPayment(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<Payment | null> {
		const db = getDB(platform);
		const payment = await db
			.prepare('SELECT * FROM payments WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<Payment>();
		if (!payment) return null;

		await db
			.prepare("UPDATE payments SET status = 'rejected' WHERE id = ? AND tenant_id = ?")
			.bind(id, tenantId)
			.run();

		return await db
			.prepare(
				`SELECT p.*, st.display_name as student_name, pm.name as payment_method_name, i.invoice_number
				 FROM payments p
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = p.tenant_id
				 LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
				 LEFT JOIN invoices i ON p.invoice_id = i.id
				 WHERE p.id = ?`
			)
			.bind(id)
			.first<Payment>();
	}
	// ----------------------------------------------------------
	// Internal Helpers
	// ----------------------------------------------------------

	private static async _recalculateInvoiceStatus(
		db: D1Database,
		invoiceId: string
	): Promise<void> {
		const invoice = await db
			.prepare('SELECT * FROM invoices WHERE id = ?')
			.bind(invoiceId)
			.first<Invoice>();
		if (!invoice) return;

		const paidResult = await db
			.prepare(
				`SELECT COALESCE(SUM(amount), 0) as total_paid
				 FROM payments WHERE invoice_id = ? AND status = 'verified'`
			)
			.bind(invoiceId)
			.first<{ total_paid: number }>();

		const totalPaid = paidResult?.total_paid ?? 0;
		let newStatus = invoice.status;

		if (totalPaid >= invoice.total_amount) {
			newStatus = 'paid';
		} else if (totalPaid > 0) {
			newStatus = 'partial';
		}

		if (newStatus !== invoice.status) {
			await db
				.prepare('UPDATE invoices SET status = ?, updated_at = datetime("now") WHERE id = ?')
				.bind(newStatus, invoiceId)
				.run();
		}
	}
}

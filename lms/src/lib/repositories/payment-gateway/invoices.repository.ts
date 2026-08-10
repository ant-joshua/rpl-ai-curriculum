import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Invoices — split from payment-gateway.repository.ts
// ============================================================
export interface InvoiceItem {
	id: string;
	tenant_id: string;
	invoice_id: string;
	fee_structure_id: string | null;
	description: string;
	amount: number;
	quantity: number;
	created_at?: string;
}

export interface Invoice {
	id: string;
	tenant_id: string;
	student_id: string;
	invoice_number: string;
	fee_structure_id: string | null;
	amount: number;
	discount: number;
	fine: number;
	total_amount: number;
	due_date: string | null;
	status: string;
	notes: string | null;
	created_at?: string;
	updated_at?: string;
	// joined
	student_name?: string;
	items?: InvoiceItem[];
	paid_amount?: number;
}

export class InvoicesRepository {
	// ----------------------------------------------------------
	// Invoices
	// ----------------------------------------------------------
	static async createInvoice(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			student_id: string;
			items: Array<{
				fee_structure_id?: string;
				description: string;
				amount: number;
				quantity?: number;
			}>;
			due_date?: string;
			discount?: number;
			fine?: number;
			notes?: string;
		}
	): Promise<Invoice> {
		const db = getDB(platform);
		const id = crypto.randomUUID();

		// Calculate total from items
		let subtotal = 0;
		for (const item of data.items) {
			subtotal += item.amount * (item.quantity || 1);
		}

		const discount = data.discount ?? 0;
		const fine = data.fine ?? 0;
		const totalAmount = subtotal - discount + fine;

		// Generate invoice number
		const now = new Date();
		const seq = String(now.getTime()).slice(-6);
		const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${seq}`;

		const createdAt = now.toISOString();

		await db
			.prepare(
				`INSERT INTO invoices (id, tenant_id, student_id, invoice_number, amount, discount, fine, total_amount, due_date, status, notes, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', ?, ?, ?)`
			)
			.bind(
				id,
				tenantId,
				data.student_id,
				invoiceNumber,
				subtotal,
				discount,
				fine,
				totalAmount,
				data.due_date ?? null,
				data.notes ?? null,
				createdAt,
				createdAt
			)
			.run();

		// Insert invoice items
		for (const item of data.items) {
			const itemId = crypto.randomUUID();
			await db
				.prepare(
					`INSERT INTO invoice_items (id, tenant_id, invoice_id, fee_structure_id, description, amount, quantity, created_at)
					 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					itemId,
					tenantId,
					id,
					item.fee_structure_id ?? null,
					item.description,
					item.amount,
					item.quantity || 1,
					createdAt
				)
				.run();
		}

		// Return full invoice with items
		const invoice = await db
			.prepare('SELECT * FROM invoices WHERE id = ?')
			.bind(id)
			.first<Invoice>();
		const items = await db
			.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY created_at ASC')
			.bind(id)
			.all<InvoiceItem>();

		return { ...invoice!, items: items.results || [] };
	}

	static async listInvoices(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		filters?: {
			status?: string;
			studentId?: string;
			academicYear?: string;
			page?: number;
			limit?: number;
		}
	): Promise<{ invoices: Invoice[]; total: number; page: number; limit: number; totalPages: number }> {
		const db = getDB(platform);
		const page = filters?.page || 1;
		const limit = Math.min(filters?.limit || 20, 100);
		const offset = (page - 1) * limit;

		const conditions = ['i.tenant_id = ?'];
		const binds: unknown[] = [tenantId];

		if (filters?.status) {
			conditions.push('i.status = ?');
			binds.push(filters.status);
		}
		if (filters?.studentId) {
			conditions.push('i.student_id = ?');
			binds.push(filters.studentId);
		}
		if (filters?.academicYear) {
			conditions.push('i.invoice_number LIKE ?');
			binds.push(`%${filters.academicYear}%`);
		}

		const where = conditions.join(' AND ');

		// Count total
		const countResult = await db
			.prepare(`SELECT COUNT(*) as cnt FROM invoices i WHERE ${where}`)
			.bind(...binds)
			.first<{ cnt: number }>();
		const total = countResult?.cnt ?? 0;

		// Fetch invoices
		const invoiceBinds = [...binds];
		const rows = await db
			.prepare(
				`SELECT i.*, st.display_name as student_name
				 FROM invoices i
				 LEFT JOIN users st ON i.student_id = st.id AND st.tenant_id = i.tenant_id
				 WHERE ${where}
				 ORDER BY i.created_at DESC
				 LIMIT ? OFFSET ?`
			)
			.bind(...invoiceBinds, limit, offset)
			.all<Invoice>();
		const invoices = rows.results || [];

		// Attach items and paid amounts
		for (const inv of invoices) {
			const items = await db
				.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?')
				.bind(inv.id)
				.all<InvoiceItem>();
			inv.items = items.results || [];

			const paidResult = await db
				.prepare(
					`SELECT COALESCE(SUM(amount), 0) as paid FROM payments
					 WHERE invoice_id = ? AND status = 'verified'`
				)
				.bind(inv.id)
				.first<{ paid: number }>();
			inv.paid_amount = paidResult?.paid ?? 0;
		}

		return {
			invoices,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit)
		};
	}

	static async getInvoice(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<Invoice | null> {
		const db = getDB(platform);
		const invoice = await db
			.prepare(
				`SELECT i.*, st.display_name as student_name
				 FROM invoices i
				 LEFT JOIN users st ON i.student_id = st.id AND st.tenant_id = i.tenant_id
				 WHERE i.id = ? AND i.tenant_id = ?`
			)
			.bind(id, tenantId)
			.first<Invoice>();
		if (!invoice) return null;

		const items = await db
			.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY created_at ASC')
			.bind(id)
			.all<InvoiceItem>();
		invoice.items = items.results || [];

		const paidResult = await db
			.prepare(
				`SELECT COALESCE(SUM(amount), 0) as paid FROM payments
				 WHERE invoice_id = ? AND status = 'verified'`
			)
			.bind(id)
			.first<{ paid: number }>();
		invoice.paid_amount = paidResult?.paid ?? 0;

		return invoice;
	}

	static async updateInvoiceStatus(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		status: string
	): Promise<Invoice | null> {
		const db = getDB(platform);
		const validStatuses = ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'];
		if (!validStatuses.includes(status)) return null;

		const existing = await db
			.prepare('SELECT * FROM invoices WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<Invoice>();
		if (!existing) return null;

		await db
			.prepare('UPDATE invoices SET status = ?, updated_at = datetime("now") WHERE id = ? AND tenant_id = ?')
			.bind(status, id, tenantId)
			.run();

		return await this.getInvoice(platform, id, tenantId);
	}

	static async deleteInvoice(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<boolean> {
		const db = getDB(platform);

		// Check for existing payments
		const paymentCheck = await db
			.prepare(
				`SELECT COUNT(*) as cnt FROM payments WHERE invoice_id = ? AND status IN ('verified', 'pending')`
			)
			.bind(id)
			.first<{ cnt: number }>();
		if ((paymentCheck?.cnt ?? 0) > 0) {
			throw new Error('Cannot delete invoice with existing payments');
		}

		// Delete items first
		await db
			.prepare('DELETE FROM invoice_items WHERE invoice_id = ?')
			.bind(id)
			.run();

		const result = await db
			.prepare('DELETE FROM invoices WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
	}
}

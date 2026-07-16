import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Interfaces
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

export interface PaymentStats {
	totalRevenue: number;
	totalPending: number;
	totalOverdue: number;
	invoiceCount: number;
	paidCount: number;
	recentPayments: Payment[];
}

// ============================================================
// Repository
// ============================================================

export class PaymentGatewayRepository {
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

	static async approveRefund(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string,
		approvedBy: string
	): Promise<Refund | null> {
		const db = getDB(platform);
		const refund = await db
			.prepare('SELECT * FROM refunds WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<Refund>();
		if (!refund || refund.status !== 'pending') return null;

		await db
			.prepare(
				"UPDATE refunds SET status = 'approved', approved_by = ? WHERE id = ? AND tenant_id = ?"
			)
			.bind(approvedBy, id, tenantId)
			.run();

		return await db
			.prepare(
				`SELECT r.*, st.display_name as student_name, p.amount as payment_amount
				 FROM refunds r
				 LEFT JOIN payments p ON r.payment_id = p.id
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = r.tenant_id
				 WHERE r.id = ?`
			)
			.bind(id)
			.first<Refund>();
	}

	static async processRefund(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<Refund | null> {
		const db = getDB(platform);
		const refund = await db
			.prepare('SELECT * FROM refunds WHERE id = ? AND tenant_id = ?')
			.bind(id, tenantId)
			.first<Refund>();
		if (!refund || refund.status !== 'approved') return null;

		const now = new Date().toISOString();
		await db
			.prepare(
				"UPDATE refunds SET status = 'processed', processed_at = ? WHERE id = ? AND tenant_id = ?"
			)
			.bind(now, id, tenantId)
			.run();

		return await db
			.prepare(
				`SELECT r.*, st.display_name as student_name, p.amount as payment_amount
				 FROM refunds r
				 LEFT JOIN payments p ON r.payment_id = p.id
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = r.tenant_id
				 WHERE r.id = ?`
			)
			.bind(id)
			.first<Refund>();
	}

	// ----------------------------------------------------------
	// Dashboard Stats
	// ----------------------------------------------------------

	static async getPaymentStats(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		academicYear?: string
	): Promise<PaymentStats> {
		const db = getDB(platform);

		// Total revenue (verified payments)
		const revenueCondition = academicYear
			? `AND i.invoice_number LIKE '%${academicYear}%'`
			: '';
		const revenueResult = await db
			.prepare(
				`SELECT COALESCE(SUM(p.amount), 0) as total
				 FROM payments p
				 JOIN invoices i ON p.invoice_id = i.id AND p.tenant_id = i.tenant_id
				 WHERE p.tenant_id = ? AND p.status = 'verified' ${revenueCondition}`
			)
			.bind(tenantId)
			.first<{ total: number }>();

		// Total pending
		const pendingResult = await db
			.prepare(
				`SELECT COALESCE(SUM(p.amount), 0) as total
				 FROM payments p
				 WHERE p.tenant_id = ? AND p.status = 'pending'`
			)
			.bind(tenantId)
			.first<{ total: number }>();

		// Total overdue
		const overdueResult = await db
			.prepare(
				`SELECT COALESCE(SUM(i.total_amount), 0) as total
				 FROM invoices i
				 WHERE i.tenant_id = ? AND i.status = 'overdue'`
			)
			.bind(tenantId)
			.first<{ total: number }>();

		// Invoice count
		const invoiceCondition = academicYear
			? `AND invoice_number LIKE '%${academicYear}%'`
			: '';
		const invoiceCountResult = await db
			.prepare(
				`SELECT COUNT(*) as cnt FROM invoices WHERE tenant_id = ? ${invoiceCondition}`
			)
			.bind(tenantId)
			.first<{ cnt: number }>();

		// Paid count
		const paidCountResult = await db
			.prepare(
				`SELECT COUNT(*) as cnt FROM invoices WHERE tenant_id = ? AND status = 'paid' ${invoiceCondition}`
			)
			.bind(tenantId)
			.first<{ cnt: number }>();

		// Recent payments
		const recentRows = await db
			.prepare(
				`SELECT p.*, st.display_name as student_name, pm.name as payment_method_name, i.invoice_number
				 FROM payments p
				 LEFT JOIN users st ON p.student_id = st.id AND st.tenant_id = p.tenant_id
				 LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
				 LEFT JOIN invoices i ON p.invoice_id = i.id
				 WHERE p.tenant_id = ?
				 ORDER BY p.created_at DESC
				 LIMIT 10`
			)
			.bind(tenantId)
			.all<Payment>();

		return {
			totalRevenue: revenueResult?.total ?? 0,
			totalPending: pendingResult?.total ?? 0,
			totalOverdue: overdueResult?.total ?? 0,
			invoiceCount: invoiceCountResult?.cnt ?? 0,
			paidCount: paidCountResult?.cnt ?? 0,
			recentPayments: recentRows.results || []
		};
	}

	// ----------------------------------------------------------
	// Webhook / Callback
	// ----------------------------------------------------------

	static async logCallback(
		platform: { env: { DB: D1Database } },
		tenantId: string,
		data: {
			provider: string;
			payment_id?: string;
			payload: string;
		}
	): Promise<PaymentCallback> {
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO payment_callbacks (id, tenant_id, payment_id, provider, payload, processed, created_at)
				 VALUES (?, ?, ?, ?, ?, 0, ?)`
			)
			.bind(id, tenantId, data.payment_id ?? null, data.provider, data.payload, now)
			.run();

		const row = await db
			.prepare('SELECT * FROM payment_callbacks WHERE id = ?')
			.bind(id)
			.first<PaymentCallback>();
		return row!;
	}

	static async markCallbackProcessed(
		platform: { env: { DB: D1Database } },
		id: string,
		tenantId: string
	): Promise<boolean> {
		const db = getDB(platform);
		const now = new Date().toISOString();
		const result = await db
			.prepare(
				'UPDATE payment_callbacks SET processed = 1, processed_at = ? WHERE id = ? AND tenant_id = ?'
			)
			.bind(now, id, tenantId)
			.run();
		return (result.meta?.changes ?? 0) > 0;
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

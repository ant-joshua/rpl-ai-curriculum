import type { D1Database } from '@cloudflare/workers-types';
import { getDB } from '$lib/server/d1';

// ============================================================
// Payment Stats — split from payment-gateway.repository.ts
// ============================================================
export interface PaymentStats {
	totalRevenue: number;
	totalPending: number;
	totalOverdue: number;
	invoiceCount: number;
	paidCount: number;
	recentPayments: Payment[];
}

export class PaymentStatsRepository {
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
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalRevenue = await db
			.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = ?')
			.bind('verified')
			.first<{ total: number }>();

		const totalInvoices = await db
			.prepare('SELECT COUNT(*) as count FROM invoices')
			.first<{ count: number }>();

		const totalPayments = await db
			.prepare('SELECT COUNT(*) as count FROM payments')
			.first<{ count: number }>();

		const pendingInvoices = await db
			.prepare("SELECT COUNT(*) as count FROM invoices WHERE status IN ('unpaid', 'partial')")
			.first<{ count: number }>();

		const revenueByMethod = await db
			.prepare(
				`SELECT p.payment_type as method, COALESCE(SUM(p.amount), 0) as total, COUNT(*) as count
				 FROM payments p
				 WHERE p.status = ?
				 GROUP BY p.payment_type
				 ORDER BY total DESC`,
			)
			.bind('verified')
			.all();

		return jsonResponse({
			success: true,
			data: {
				totalRevenue: totalRevenue?.total ?? 0,
				totalInvoices: totalInvoices?.count ?? 0,
				totalPayments: totalPayments?.count ?? 0,
				pendingInvoices: pendingInvoices?.count ?? 0,
				revenueByMethod: revenueByMethod.results ?? [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

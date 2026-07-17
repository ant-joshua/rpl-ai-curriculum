import { jsonResponse } from '$lib/server/d1';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/payment/[invoiceId]/status
 * Poll payment status for a specific invoice.
 * Auth: Bearer token (student session)
 */
export async function GET({ params, request, platform }: {
	params: { invoiceId: string };
	request: Request;
	platform: App.Platform;
}) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session tidak valid' }, 401);
		}

		const db = getDB(platform);
		const { invoiceId } = params;

		if (!invoiceId) {
			return jsonResponse({ success: false, error: 'Invoice ID diperlukan' }, 400);
		}

		const studentId = session.user.id;

		// Get invoice
		const invoice = await db
			.prepare('SELECT * FROM invoices WHERE id = ? AND student_id = ?')
			.bind(invoiceId, studentId)
			.first<any>();

		if (!invoice) {
			return jsonResponse({ success: false, error: 'Invoice tidak ditemukan' }, 404);
		}

		// Get latest payment
		const payment = await db
			.prepare(
				`SELECT id, amount, status, payment_type, gateway_transaction_id, snap_token, verified_at, created_at
				 FROM payments WHERE invoice_id = ? AND student_id = ?
				 ORDER BY created_at DESC LIMIT 1`
			)
			.bind(invoiceId, studentId)
			.first<any>();

		// Get invoice items
		const items = await db
			.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?')
			.bind(invoiceId)
			.all<any>();

		return jsonResponse({
			success: true,
			data: {
				invoice: {
					id: invoice.id,
					invoice_number: invoice.invoice_number,
					amount: invoice.total_amount,
					status: invoice.status,
					due_date: invoice.due_date,
					paid_at: invoice.paid_at,
					created_at: invoice.created_at,
					items: items.results || [],
				},
				payment: payment
					? {
							id: payment.id,
							amount: payment.amount,
							status: payment.status,
							payment_type: payment.payment_type,
							gateway_transaction_id: payment.gateway_transaction_id,
							snap_token: payment.snap_token,
							verified_at: payment.verified_at,
							created_at: payment.created_at,
					  }
					: null,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

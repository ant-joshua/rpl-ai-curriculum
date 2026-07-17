import { jsonResponse } from '$lib/server/d1';
import { createSnapTransaction, getClientKey, formatAmount } from '$lib/server/midtrans';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * POST /api/payment/midtrans/snap
 * Create a Midtrans Snap transaction for a student invoice.
 * Body: { invoice_id }
 * Auth: Bearer token (student session)
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
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
		const body = await request.json();
		const { invoice_id } = body;

		if (!invoice_id) {
			return jsonResponse({ success: false, error: 'Invoice ID wajib diisi' }, 400);
		}

		const studentId = session.user.id;

		// Get invoice — verify ownership
		const invoice = await db
			.prepare('SELECT * FROM invoices WHERE id = ? AND student_id = ?')
			.bind(invoice_id, studentId)
			.first<any>();

		if (!invoice) {
			return jsonResponse({ success: false, error: 'Invoice tidak ditemukan' }, 404);
		}

		if (invoice.status === 'paid') {
			return jsonResponse({ success: false, error: 'Invoice sudah dibayar' }, 400);
		}

		if (invoice.status === 'cancelled') {
			return jsonResponse({ success: false, error: 'Invoice sudah dibatalkan' }, 400);
		}

		// Get student info for customer details
		const student = await db
			.prepare('SELECT display_name, email FROM users WHERE id = ?')
			.bind(studentId)
			.first<any>();

		// Get invoice items
		const items = await db
			.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?')
			.bind(invoice_id)
			.all<any>();

		// Create order_id with prefix for Midtrans
		const orderId = `INV-${invoice.invoice_number}-${Date.now()}`;

		// Build item details
		const itemDetails = (items.results || []).map((item: any) => ({
			id: item.id,
			name: item.description,
			price: formatAmount(item.amount),
			quantity: item.quantity || 1,
		}));

		const customerDetails = {
			first_name: student?.display_name || 'Siswa',
			email: student?.email || '',
		};

		// Create Snap transaction
		const snap = await createSnapTransaction(
			platform,
			orderId,
			formatAmount(invoice.total_amount),
			customerDetails,
			itemDetails.length > 0 ? itemDetails : undefined
		);

		// Save snap_token to payment record
		// First check if there's an existing pending payment for this invoice
		const existingPayment = await db
			.prepare("SELECT * FROM payments WHERE invoice_id = ? AND student_id = ? AND status = 'pending' AND snap_token IS NOT NULL")
			.bind(invoice_id, studentId)
			.first<any>();

		if (existingPayment) {
			// Update existing pending payment with new snap token
			await db
				.prepare('UPDATE payments SET snap_token = ?, gateway_transaction_id = ?, updated_at = datetime("now") WHERE id = ?')
				.bind(snap.token, snap.transaction_id || null, existingPayment.id)
				.run();
		} else {
			// Create a new payment record with pending status
			const paymentId = crypto.randomUUID();
			await db
				.prepare(
					`INSERT INTO payments (id, tenant_id, invoice_id, student_id, amount, payment_date, payment_type, status, snap_token, gateway_transaction_id, created_at)
				 VALUES (?, ?, ?, ?, ?, datetime('now'), 'credit_card', 'pending', ?, ?, datetime('now'))`
				)
				.bind(
					paymentId,
					invoice.tenant_id,
					invoice_id,
					studentId,
					formatAmount(invoice.total_amount),
					snap.token,
					snap.transaction_id || null
				)
				.run();
		}

		return jsonResponse({
			success: true,
			data: {
				snap_token: snap.token,
				redirect_url: snap.redirect_url,
				client_key: getClientKey(platform),
				order_id: orderId,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Gagal membuat transaksi';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

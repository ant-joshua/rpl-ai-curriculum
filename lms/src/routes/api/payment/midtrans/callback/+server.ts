import { jsonResponse } from '$lib/server/d1';
import { getDB } from '$lib/server/d1';

/**
 * POST /api/payment/midtrans/callback
 * Midtrans payment notification webhook (Payment Notification URL).
 * Midtrans sends POST with JSON body containing transaction status.
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const db = getDB(platform);
		const body = await request.json();

		// Extract key fields from Midtrans notification
		const {
			order_id,
			transaction_status,
			status_code,
			gross_amount,
			signature_key,
			transaction_id,
			payment_type,
			transaction_time,
			settlement_time,
			fraud_status,
		} = body;

		// Validate signature
		const serverKey = platform.env.MIDTRANS_SERVER_KEY || '';
		const hash = await crypto.subtle.digest(
			'SHA-512',
			new TextEncoder().encode(order_id + status_code + gross_amount + serverKey)
		);
		const hashHex = Array.from(new Uint8Array(hash))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');

		if (hashHex !== signature_key) {
			// Log failed verification
			await db
				.prepare(
					`INSERT INTO payment_callbacks (id, tenant_id, provider, payload, processed, created_at)
				 VALUES (?, 'default', 'midtrans', ?, 0, datetime('now'))`
				)
				.bind(crypto.randomUUID(), JSON.stringify(body))
				.run();
			return jsonResponse({ success: false, error: 'Invalid signature' }, 403);
		}

		// Log callback
		const callbackId = crypto.randomUUID();
		await db
			.prepare(
				`INSERT INTO payment_callbacks (id, tenant_id, provider, payload, processed, created_at)
			 VALUES (?, 'default', 'midtrans', ?, 0, datetime('now'))`
			)
			.bind(callbackId, JSON.stringify(body))
			.run();

		// Extract invoice number from order_id
		// Order ID format: INV-{invoice_number}-{timestamp}
		const match = order_id.match(/^(INV-\d{8}-\d{6})/);
		if (!match) {
			await db
				.prepare('UPDATE payment_callbacks SET processed = 1, processed_at = datetime("now") WHERE id = ?')
				.bind(callbackId)
				.run();
			return jsonResponse({ success: false, error: 'Invalid order_id format' }, 400);
		}
		const invoiceNumber = match[1];

		// Find the invoice
		const invoice = await db
			.prepare('SELECT * FROM invoices WHERE invoice_number = ?')
			.bind(invoiceNumber)
			.first<any>();

		if (!invoice) {
			await db
				.prepare('UPDATE payment_callbacks SET processed = 1, processed_at = datetime("now") WHERE id = ?')
				.bind(callbackId)
				.run();
			return jsonResponse({ success: false, error: 'Invoice not found' }, 404);
		}

		// Determine payment status based on Midtrans transaction_status + fraud_status
		let paymentStatus: string;
		let invoiceStatus: string | null = null;

		if (transaction_status === 'capture' || transaction_status === 'settlement') {
			if (fraud_status === 'accept' || !fraud_status) {
				paymentStatus = 'verified';
				invoiceStatus = 'paid';
			} else if (fraud_status === 'challenge') {
				paymentStatus = 'pending';
			} else {
				paymentStatus = 'rejected';
			}
		} else if (transaction_status === 'pending') {
			paymentStatus = 'pending';
		} else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
			paymentStatus = 'rejected';
		} else if (transaction_status === 'refund' || transaction_status === 'partial_refund') {
			paymentStatus = 'verified'; // Keep verified, invoice stays paid
		} else {
			paymentStatus = 'pending';
		}

		// Find existing payment record for this invoice + transaction
		let payment = await db
			.prepare('SELECT * FROM payments WHERE invoice_id = ? AND gateway_transaction_id = ?')
			.bind(invoice.id, transaction_id)
			.first<any>();

		const now = new Date().toISOString();

		if (payment) {
			// Update existing payment
			await db
				.prepare(
					`UPDATE payments SET status = ?, provider_transaction_id = ?, payment_date = ?, updated_at = ?
				 WHERE id = ?`
				)
				.bind(
					paymentStatus,
					transaction_id || null,
					settlement_time || transaction_time || now,
					now,
					payment.id
				)
				.run();

			if (paymentStatus === 'verified') {
				await db
					.prepare(
						`UPDATE payments SET verified_by = 'midtrans', verified_at = ? WHERE id = ?`
					)
					.bind(now, payment.id)
					.run();
			}
		} else {
			// Create new payment record from callback
			const paymentId = crypto.randomUUID();
			await db
				.prepare(
					`INSERT INTO payments (id, tenant_id, invoice_id, student_id, amount, payment_date, payment_type, gateway_transaction_id, provider_transaction_id, snap_token, status, verified_by, verified_at, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(
					paymentId,
					invoice.tenant_id,
					invoice.id,
					invoice.student_id,
					gross_amount || invoice.total_amount,
					settlement_time || transaction_time || now,
					payment_type || 'credit_card',
					transaction_id || null,
					transaction_id || null,
					null, // no snap token from callback
					paymentStatus,
					paymentStatus === 'verified' ? 'midtrans' : null,
					paymentStatus === 'verified' ? now : null,
					now
				)
				.run();
		}

		// Update invoice status if payment is verified
		if (invoiceStatus) {
			await db
				.prepare(
					`UPDATE invoices SET status = ?, updated_at = ?, paid_at = ? WHERE id = ?`
				)
				.bind(invoiceStatus, now, paymentStatus === 'verified' ? now : null, invoice.id)
				.run();
		}

		// Mark callback as processed
		await db
			.prepare('UPDATE payment_callbacks SET processed = 1, processed_at = datetime("now") WHERE id = ?')
			.bind(callbackId)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

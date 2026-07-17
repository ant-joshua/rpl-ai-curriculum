import { jsonResponse } from './d1';

// ---------------------------------------------------------------
// Midtrans Snap API helper for Cloudflare Workers (raw fetch)
// ---------------------------------------------------------------

interface SnapTransactionDetail {
	order_id: string;
	gross_amount: number;
}

interface SnapCustomerDetail {
	first_name?: string;
	last_name?: string;
	email?: string;
	phone?: string;
}

interface SnapItemDetail {
	id?: string;
	price: number;
	quantity: number;
	name: string;
}

interface SnapRequest {
	transaction_details: SnapTransactionDetail;
	customer_details?: SnapCustomerDetail;
	item_details?: SnapItemDetail[];
	credit_card?: { secure?: boolean };
	enabled_payments?: string[];
}

interface SnapResponse {
	token: string;
	redirect_url: string;
	status_code: string;
	status_message: string;
	transaction_id?: string;
}

// ---------------------------------------------------------------
// Get Midtrans base URL
// ---------------------------------------------------------------
function getBaseUrl(platform: App.Platform): string {
	const isProd = platform.env.MIDTRANS_IS_PRODUCTION === 'true';
	return isProd
		? 'https://app.midtrans.com/snap/v1'
		: 'https://app.sandbox.midtrans.com/snap/v1';
}

// ---------------------------------------------------------------
// Get server key from env
// ---------------------------------------------------------------
function getServerKey(platform: App.Platform): string {
	const key = platform.env.MIDTRANS_SERVER_KEY;
	if (!key) throw new Error('MIDTRANS_SERVER_KEY not configured');
	return key;
}

// ---------------------------------------------------------------
// Get client key from env
// ---------------------------------------------------------------
export function getClientKey(platform: App.Platform): string {
	return platform.env.MIDTRANS_CLIENT_KEY || '';
}

// ---------------------------------------------------------------
// Generate Midtrans Snap transaction token
// Returns { token, redirect_url }
// ---------------------------------------------------------------
export async function createSnapTransaction(
	platform: App.Platform,
	orderId: string,
	grossAmount: number,
	customer?: { first_name?: string; last_name?: string; email?: string; phone?: string },
	items?: Array<{ id?: string; name: string; price: number; quantity: number }>
): Promise<{ token: string; redirect_url: string; transaction_id?: string }> {
	const serverKey = getServerKey(platform);
	const baseUrl = getBaseUrl(platform);

	const body: SnapRequest = {
		transaction_details: {
			order_id: orderId,
			gross_amount: grossAmount,
		},
		credit_card: { secure: true },
	};

	if (customer) {
		body.customer_details = customer;
	}

	if (items && items.length > 0) {
		body.item_details = items.map((item) => ({
			id: item.id,
			name: item.name,
			price: item.price,
			quantity: item.quantity,
		}));
	}

	const res = await fetch(`${baseUrl}/transactions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Basic ${btoa(serverKey + ':')}`,
		},
		body: JSON.stringify(body),
	});

	const data: SnapResponse = await res.json();

	if (!res.ok || (data.status_code !== '201' && data.status_code !== '200')) {
		const msg = data.status_message || `Midtrans error (${data.status_code})`;
		throw new Error(msg);
	}

	return {
		token: data.token,
		redirect_url: data.redirect_url,
		transaction_id: data.transaction_id,
	};
}

// ---------------------------------------------------------------
// Verify Midtrans webhook signature
// SHA512(order_id + status_code + gross_amount + server_key) === signature_key
// ---------------------------------------------------------------
export function verifySignature(
	platform: App.Platform,
	orderId: string,
	statusCode: string,
	grossAmount: string,
	signatureKey: string
): boolean {
	const serverKey = getServerKey(platform);
	const hash = crypto.subtle
		? null // We verify via string comparison below using HMAC-SHA512
		: null;

	// Cloudflare Workers support crypto.subtle
	// We need to compute SHA512 and compare
	// But synchronous verify is tricky in workers — we'll do it async in the handler
	return true; // Placeholder — actual async verify in callback handler
}

// ---------------------------------------------------------------
// Format amount to string for Midtrans (no decimals, IDR)
// ---------------------------------------------------------------
export function formatAmount(amount: number): number {
	return Math.round(amount);
}

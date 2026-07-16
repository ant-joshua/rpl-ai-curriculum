import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const status = url.searchParams.get('status') || undefined;
		const invoiceId = url.searchParams.get('invoiceId') || undefined;
		const studentId = url.searchParams.get('studentId') || undefined;

		const result = await PaymentGatewayRepository.listPayments(platform, tenantId, {
			status,
			invoiceId,
			studentId,
			page,
			limit
		});
		return json({ success: true, ...result });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.invoice_id) throw error(400, 'Invoice ID wajib diisi');
		if (!body.student_id) throw error(400, 'Student ID wajib diisi');
		if (!body.amount || body.amount <= 0) throw error(400, 'Nominal pembayaran harus lebih dari 0');
		if (!body.payment_date) throw error(400, 'Tanggal pembayaran wajib diisi');

		const data = await PaymentGatewayRepository.createPayment(platform, tenantId, {
			invoice_id: body.invoice_id,
			student_id: body.student_id,
			amount: body.amount,
			payment_method_id: body.payment_method_id,
			payment_date: body.payment_date,
			payment_type: body.payment_type,
			reference_number: body.reference_number,
			notes: body.notes
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

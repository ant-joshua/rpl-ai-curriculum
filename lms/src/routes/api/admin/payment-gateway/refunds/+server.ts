import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const data = await PaymentGatewayRepository.listRefunds(platform, tenantId);
		return json({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const userId = locals.user?.id || 'admin';
		const body = await request.json();
		if (!body.payment_id) throw error(400, 'Payment ID wajib diisi');
		if (!body.amount || body.amount <= 0) throw error(400, 'Nominal refund harus lebih dari 0');

		const data = await PaymentGatewayRepository.createRefund(platform, tenantId, {
			payment_id: body.payment_id,
			amount: body.amount,
			reason: body.reason,
			requested_by: userId
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

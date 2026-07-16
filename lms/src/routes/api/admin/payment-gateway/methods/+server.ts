import { json } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const methods = await PaymentGatewayRepository.getPaymentMethods(platform, tenantId);
		return json({ success: true, data: methods });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		const id = await PaymentGatewayRepository.createPaymentMethod(platform, tenantId, {
			code: body.code,
			name: body.name,
			type: body.type,
			provider: body.provider,
			account_number: body.account_number,
			account_name: body.account_name,
			admin_fee: body.admin_fee,
			admin_fee_type: body.admin_fee_type,
			instruction: body.instruction,
			min_amount: body.min_amount,
			max_amount: body.max_amount
		});
		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function PUT({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		const userId = locals.user?.id || 'admin';

		if (body.action === 'verify') {
			const data = await PaymentGatewayRepository.verifyPayment(platform, params.id, tenantId, userId);
			if (!data) throw error(404, 'Payment tidak ditemukan');
			return json({ success: true, data });
		} else if (body.action === 'reject') {
			const data = await PaymentGatewayRepository.rejectPayment(platform, params.id, tenantId);
			if (!data) throw error(404, 'Payment tidak ditemukan');
			return json({ success: true, data });
		} else {
			throw error(400, 'Action harus "verify" atau "reject"');
		}
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

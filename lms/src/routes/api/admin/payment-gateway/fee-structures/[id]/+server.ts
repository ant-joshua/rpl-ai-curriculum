import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function PUT({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const data = await PaymentGatewayRepository.updateFeeStructure(platform, params.id, tenantId, {
			name: body.name,
			code: body.code,
			description: body.description,
			amount: body.amount,
			fee_type: body.fee_type,
			academic_year: body.academic_year,
			semester: body.semester,
			is_active: body.is_active
		});
		if (!data) throw error(404, 'Fee structure tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const deleted = await PaymentGatewayRepository.deleteFeeStructure(platform, params.id, tenantId);
		if (!deleted) throw error(404, 'Fee structure tidak ditemukan');
		return json({ success: true, message: 'Fee structure berhasil dihapus' });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

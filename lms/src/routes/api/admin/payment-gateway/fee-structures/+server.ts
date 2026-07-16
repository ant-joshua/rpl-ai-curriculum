import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const filters: Record<string, string | undefined> = {};
		const fee_type = url.searchParams.get('fee_type');
		const academic_year = url.searchParams.get('academic_year');
		if (fee_type) filters.fee_type = fee_type;
		if (academic_year) filters.academic_year = academic_year;

		const data = await PaymentGatewayRepository.getFeeStructures(platform, tenantId, filters);
		return json({ success: true, data });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.name) throw error(400, 'Nama fee structure wajib diisi');
		if (body.amount === undefined || body.amount === null) throw error(400, 'Jumlah nominal wajib diisi');
		if (!body.fee_type) throw error(400, 'Tipe fee wajib diisi');

		const data = await PaymentGatewayRepository.createFeeStructure(platform, tenantId, {
			name: body.name,
			code: body.code,
			description: body.description,
			amount: body.amount,
			fee_type: body.fee_type,
			academic_year: body.academic_year,
			semester: body.semester,
			is_active: body.is_active
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

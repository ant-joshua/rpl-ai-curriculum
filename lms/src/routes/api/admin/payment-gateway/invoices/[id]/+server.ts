import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const data = await PaymentGatewayRepository.getInvoice(platform, params.id, tenantId);
		if (!data) throw error(404, 'Invoice tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.status) throw error(400, 'Status wajib diisi');

		const validStatuses = ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'];
		if (!validStatuses.includes(body.status)) {
			throw error(400, 'Status tidak valid');
		}

		const data = await PaymentGatewayRepository.updateInvoiceStatus(platform, params.id, tenantId, body.status);
		if (!data) throw error(404, 'Invoice tidak ditemukan');
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
		const deleted = await PaymentGatewayRepository.deleteInvoice(platform, params.id, tenantId);
		if (!deleted) throw error(404, 'Invoice tidak ditemukan');
		return json({ success: true, message: 'Invoice berhasil dihapus' });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

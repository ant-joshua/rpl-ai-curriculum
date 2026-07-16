import { json, error } from '@sveltejs/kit';
import { PaymentGatewayRepository } from '$lib/repositories/payment-gateway.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const status = url.searchParams.get('status') || undefined;
		const studentId = url.searchParams.get('studentId') || undefined;
		const academicYear = url.searchParams.get('academicYear') || undefined;

		const result = await PaymentGatewayRepository.listInvoices(platform, tenantId, {
			status,
			studentId,
			academicYear,
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
		if (!body.student_id) throw error(400, 'Student ID wajib diisi');
		if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
			throw error(400, 'Minimal satu item invoice wajib diisi');
		}

		const data = await PaymentGatewayRepository.createInvoice(platform, tenantId, {
			student_id: body.student_id,
			items: body.items,
			due_date: body.due_date,
			discount: body.discount,
			fine: body.fine,
			notes: body.notes
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

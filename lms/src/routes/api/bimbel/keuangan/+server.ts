import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { BimbelRepository } from '$lib/repositories/bimbel.repository';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);

		const batchId = url.searchParams.get('batch_id') || undefined;
		const status = url.searchParams.get('status') || undefined;

		const results = await repo.getBimbelBillings({ batchId, status });
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new BimbelRepository(db, tenantId);
		const body = await request.json();

		if (!body.user_id || !body.type || body.amount === undefined || body.total === undefined) {
			throw error(400, 'user_id, type, amount, total required');
		}

		const created = await repo.createBimbelBilling({
			user_id: body.user_id,
			package_id: body.package_id || undefined,
			batch_id: body.batch_id || undefined,
			invoice_number: body.invoice_number,
			type: body.type,
			amount: body.amount,
			discount: body.discount ?? 0,
			total: body.total,
			status: body.status || 'unpaid',
			due_date: body.due_date,
			paid_at: body.paid_at,
			payment_method: body.payment_method,
			payment_proof: body.payment_proof,
			notes: body.notes
		});

		return json({ success: true, data: { id: created.id, invoice_number: created.invoice_number } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

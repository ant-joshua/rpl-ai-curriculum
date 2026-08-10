import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { TutorRepository } from '$lib/repositories/tutor.repository';

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
		const repo = new TutorRepository(db, tenantId);

		const status = url.searchParams.get('status') || undefined;
		const userId = url.searchParams.get('user_id') || undefined;

		const results = await repo.getBillings({ status, userId });
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
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		if (!body.user_id || !body.type || body.amount === undefined) {
			throw error(400, 'user_id, type, amount required');
		}

		const total = body.total ?? body.amount - (body.discount ?? 0);

		const created = await repo.createBilling({
			user_id: body.user_id,
			package_id: body.package_id || undefined,
			batch_id: body.batch_id || undefined,
			invoice_number: body.invoice_number || undefined,
			type: body.type,
			amount: body.amount,
			discount: body.discount ?? 0,
			total,
			status: body.status || 'unpaid',
			due_date: body.due_date || undefined,
			paid_at: body.paid_at || undefined,
			payment_method: body.payment_method || undefined,
			payment_proof: body.payment_proof || undefined,
			notes: body.notes || undefined
		});

		return json({ success: true, data: created }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

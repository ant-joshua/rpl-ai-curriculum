import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

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

		const batchId = url.searchParams.get('batch_id');
		const status = url.searchParams.get('status');

		let query = `
			SELECT br.*, u.display_name, u.email, lp.name AS package_name
			FROM billing_records br
			JOIN users u ON u.id = br.user_id
			LEFT JOIN learning_packages lp ON lp.id = br.package_id
			WHERE br.tenant_id = ?
		`;
		const params: any[] = [tenantId];

		if (batchId) {
			query += ' AND br.batch_id = ?';
			params.push(batchId);
		}
		if (status) {
			query += ' AND br.status = ?';
			params.push(status);
		}

		query += ' ORDER BY br.created_at DESC';

		const { results } = await db.prepare(query).bind(...params).all<any>();
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
		const body = await request.json();

		const { user_id, package_id, batch_id, type, amount, discount, total, due_date, notes } = body;
		if (!user_id || !type || amount == null || total == null) {
			throw error(400, 'user_id, type, amount, total required');
		}

		const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
		const invoiceNumber = `INV-BIMBEL-${dateStr}-${rand}`;

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO billing_records (id, tenant_id, user_id, package_id, batch_id, invoice_number, type, amount, discount, total, status, due_date, paid_at, payment_method, payment_proof, notes, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, user_id, package_id || null, batch_id || null,
			invoiceNumber, type, amount, discount ?? 0, total,
			body.status || 'unpaid', due_date || null, body.paid_at || null,
			body.payment_method || null, body.payment_proof || null,
			notes || null, now
		).run();

		return json({ success: true, data: { id, invoice_number: invoiceNumber } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

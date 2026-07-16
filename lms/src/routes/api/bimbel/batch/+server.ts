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

		const status = url.searchParams.get('status');

		let query = 'SELECT * FROM learning_packages WHERE tenant_id = ? AND type = ?';
		const params: any[] = [tenantId, 'bimbel_batch'];

		if (status) {
			query += ' AND status = ?';
			params.push(status);
		}
		query += ' ORDER BY created_at DESC';

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

		const { name, description, duration_sessions, duration_days, price, max_students, subjects } = body;
		if (!name) throw error(400, 'name required');

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO learning_packages (id, tenant_id, name, description, type, duration_sessions, duration_days, price, max_students, subjects, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, name, description || null, 'bimbel_batch',
			duration_sessions ?? null, duration_days ?? null,
			price ?? null, max_students ?? null,
			subjects ? JSON.stringify(subjects) : null,
			body.status || 'active'
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

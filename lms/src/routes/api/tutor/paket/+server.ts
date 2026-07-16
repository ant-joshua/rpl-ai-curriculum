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
		const type = url.searchParams.get('type');

		let query = 'SELECT * FROM learning_packages WHERE tenant_id = ?';
		const params: any[] = [tenantId];

		if (status) {
			query += ' AND status = ?';
			params.push(status);
		}
		if (type) {
			query += ' AND type = ?';
			params.push(type);
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

		const { name, type, description, duration_sessions, duration_days, price, max_students, subjects, includes_tryout } = body;
		if (!name || !type) {
			throw error(400, 'name and type required');
		}

		const validTypes = ['privat_sessions', 'bimbel_batch', 'kelompok_kecil', 'langganan', 'paket_tryout'];
		if (!validTypes.includes(type)) {
			throw error(400, 'invalid type');
		}

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO learning_packages (id, tenant_id, name, description, type, duration_sessions, duration_days, price, max_students, subjects, includes_tryout, status)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, name, description || null, type,
			duration_sessions ?? null, duration_days ?? null,
			price ?? null, max_students ?? null,
			subjects ? JSON.stringify(subjects) : null,
			includes_tryout ?? 0, body.status || 'active'
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

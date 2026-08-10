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
		const type = url.searchParams.get('type') || undefined;

		const results = await repo.getPackages({ status, type });
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

		const { name, type, description, duration_sessions, duration_days, price, max_students, subjects, includes_tryout } = body;
		if (!name || !type) {
			throw error(400, 'name and type required');
		}

		const validTypes = ['privat_sessions', 'bimbel_batch', 'kelompok_kecil', 'langganan', 'paket_tryout'];
		if (!validTypes.includes(type)) {
			throw error(400, 'invalid type');
		}

		const created = await repo.createPackage({
			name,
			type,
			description: description || undefined,
			duration_sessions: duration_sessions ?? undefined,
			duration_days: duration_days ?? undefined,
			price: price ?? undefined,
			max_students: max_students ?? undefined,
			subjects: subjects ? JSON.stringify(subjects) : undefined,
			includes_tryout: includes_tryout ?? 0,
			status: body.status || 'active'
		});

		return json({ success: true, data: { id: created.id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

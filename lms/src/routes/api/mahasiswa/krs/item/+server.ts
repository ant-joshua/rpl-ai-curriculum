import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { UniversityRepository } from '$lib/repositories/university.repository';

async function getAuthenticatedUser(platform: App.Platform, request: Request): Promise<any> {
	const token = getBearerToken(request);
	if (!token) throw error(401, 'Unauthorized — Bearer token required');
	const session = await getSession(platform, token);
	if (!session) throw error(401, 'Unauthorized — invalid or expired token');
	const db = getDB(platform);
	const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
	if (!user || !['student', 'admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden — student role required');
	}
	return user;
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		await getAuthenticatedUser(platform, request);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);

		const body = await request.json();
		if (!body.krs_id || !body.kelas_kuliah_id) throw error(400, 'krs_id dan kelas_kuliah_id wajib diisi');

		const data = await repo.addKRSItem(body.krs_id, body.kelas_kuliah_id);
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		await getAuthenticatedUser(platform, request);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);

		const body = await request.json();
		if (!body.krs_item_id) throw error(400, 'krs_item_id wajib diisi');

		const deleted = await repo.removeKRSItem(body.krs_item_id);
		if (!deleted) throw error(404, 'KRS item tidak ditemukan');
		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

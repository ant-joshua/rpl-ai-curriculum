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

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const user = locals.user || await getAuthenticatedUser(platform, new Request(url));
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);

		const semesterId = url.searchParams.get('academic_semester_id');
		let krs;
		if (semesterId) {
			krs = await repo.getKRSByUser(user.id, semesterId);
		} else {
			const activeSemester = await repo.getActiveSemester();
			if (!activeSemester) throw error(404, 'Tidak ada semester aktif');
			krs = await repo.getKRSByUser(user.id, activeSemester.id);
		}

		return json({ success: true, data: krs });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const user = locals.user || await getAuthenticatedUser(platform, request);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);
		const body = await request.json();

		if (!body.academic_semester_id) throw error(400, 'academic_semester_id wajib diisi');

		const data = await repo.createKRS({ user_id: user.id, academic_semester_id: body.academic_semester_id });
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

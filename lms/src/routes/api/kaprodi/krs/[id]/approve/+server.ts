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
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden — kaprodi role required');
	}
	return user;
}

export async function POST({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const user = locals.user || await getAuthenticatedUser(platform, request);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);

		const approved = await repo.approveKRS(params.id, user.id);
		if (!approved) throw error(404, 'KRS tidak ditemukan atau status bukan submitted');
		return json({ success: true, message: 'KRS berhasil disetujui' });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

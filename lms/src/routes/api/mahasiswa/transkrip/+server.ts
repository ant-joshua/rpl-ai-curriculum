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

		const records = await repo.getTranscript(user.id);
		const ipk = await repo.computeIPK(user.id);

		return json({ success: true, data: { records, ipk } });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

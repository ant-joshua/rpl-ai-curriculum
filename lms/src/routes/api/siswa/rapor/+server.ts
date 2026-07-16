import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { RaporRepository } from '$lib/repositories/rapor.repository';

export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			throw error(401, 'Unauthorized — Bearer token required');
		}

		const session = await getSession(platform, token);
		if (!session) {
			throw error(401, 'Unauthorized — invalid or expired token');
		}

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['student', 'superadmin', 'admin'].includes(user.role)) {
			throw error(403, 'Forbidden — role must be student, admin, or superadmin');
		}

		const classId = url.searchParams.get('class_id');
		const semesterParam = url.searchParams.get('semester');

		if (!classId || !semesterParam) {
			throw error(400, 'class_id dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		const tenantId = url.searchParams.get('tenant_id') || 'default';
		const repo = new RaporRepository(db, tenantId);
		const rapor = await repo.getRaporByUser(user.id, classId, semester);

		if (!rapor) {
			return json({ success: true, data: null });
		}

		return json({ success: true, data: rapor });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

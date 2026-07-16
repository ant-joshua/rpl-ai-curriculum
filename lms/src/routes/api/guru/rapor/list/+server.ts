import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { RaporRepository } from '$lib/repositories/rapor.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const classId = url.searchParams.get('class_id');
		const semesterParam = url.searchParams.get('semester');

		if (!classId || !semesterParam) {
			throw error(400, 'class_id dan semester wajib diisi');
		}

		const semester = parseInt(semesterParam, 10);
		if (isNaN(semester)) throw error(400, 'semester harus berupa angka');

		const repo = new RaporRepository(db, tenantId);
		const rapors = await repo.listRaporByClass(classId, semester);

		return json({ success: true, data: rapors });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { RaporRepository } from '$lib/repositories/rapor.repository';

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['superadmin', 'admin', 'instructor'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const body = await request.json();
		const { user_id, class_id, academic_period_id, semester } = body;

		if (!user_id || !class_id || !academic_period_id || semester == null) {
			throw error(400, 'user_id, class_id, academic_period_id, dan semester wajib diisi');
		}

		const repo = new RaporRepository(db, tenantId);
		const rapor = await repo.generateRapor(user_id, class_id, academic_period_id, semester);

		return json({ success: true, data: rapor });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

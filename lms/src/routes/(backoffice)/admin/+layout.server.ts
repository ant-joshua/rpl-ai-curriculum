import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const tenant = locals.tenant;

	if (!tenant) {
		throw error(404, {
			message: 'Tenant tidak ditemukan atau belum dikonfigurasi.'
		});
	}

	let tenantList: any[] | null = null;

	// Load tenant list for admin sidebar switcher
	if (platform) {
		try {
			const db = (platform as any).env?.DB;
			if (db) {
				const result = await db.prepare(
					'SELECT id, name, slug, type FROM tenants WHERE is_active = 1 ORDER BY name'
				).all<any>();
				tenantList = result.results || null;
			}
		} catch {
			// best-effort: tenant list is non-critical
		}
	}

	return {
		user: locals.user,
		tenant,
		tenantList,
	};
};

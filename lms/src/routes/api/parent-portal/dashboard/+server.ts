import { json, error } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const parentId = url.searchParams.get('parentId');
		if (!parentId) throw error(400, 'parentId query param wajib diisi');

		const repo = new ParentPortalRepository(platform);
		const dashboard = await repo.getParentDashboard(tenantId, parentId);
		return json({ success: true, data: dashboard });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

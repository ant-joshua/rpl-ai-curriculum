import { json } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ParentPortalRepository(platform);

		// If parentId param given, return access log
		const parentId = url.searchParams.get('parentId');
		if (parentId) {
			const log = await repo.getAccessLog(tenantId, parentId, { limit: 50 });
			return json({ success: true, data: log });
		}

		// Otherwise return overview stats
		const totalParents = await repo.getAllParentAccounts(tenantId);
		const totalStudents = await repo.getLinkedStudents(tenantId, '');
		return json({
			success: true,
			data: {
				totalParents: Array.isArray(totalParents) ? totalParents.length : (totalParents ? 1 : 0),
				totalActiveLinks: Array.isArray(totalStudents) ? totalStudents.length : 0
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

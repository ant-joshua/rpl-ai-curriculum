import { json, error } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function PUT({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const repo = new ParentPortalRepository(platform);
		const data = await repo.updateParentAccount(params.id, tenantId, body);
		if (!data) throw error(404, 'Parent account not found');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

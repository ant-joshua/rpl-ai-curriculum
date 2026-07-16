import { json, error } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ParentPortalRepository(platform);
		const parents = await repo.getAllParentAccounts(tenantId);
		return json({ success: true, data: parents });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.userId) throw error(400, 'userId wajib diisi');
		if (!body.name) throw error(400, 'name wajib diisi');
		if (!body.relationship) throw error(400, 'relationship wajib diisi');

		const repo = new ParentPortalRepository(platform);
		const data = await repo.createParentAccount(tenantId, {
			userId: body.userId,
			name: body.name,
			phone: body.phone,
			email: body.email,
			relationship: body.relationship,
			isPrimary: body.isPrimary,
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

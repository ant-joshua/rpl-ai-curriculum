import { json, error } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const parentId = url.searchParams.get('parentId');
		if (!parentId) throw error(400, 'parentId query param wajib diisi');

		const repo = new ParentPortalRepository(platform);
		const links = await repo.getLinkedStudents(tenantId, parentId);
		return json({ success: true, data: links });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();
		if (!body.parentId) throw error(400, 'parentId wajib diisi');
		if (!body.studentId) throw error(400, 'studentId wajib diisi');
		if (!body.relationship) throw error(400, 'relationship wajib diisi');

		const repo = new ParentPortalRepository(platform);
		const data = await repo.linkStudent(tenantId, {
			parentId: body.parentId,
			studentId: body.studentId,
			relationship: body.relationship,
			accessLevel: body.accessLevel,
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { ParentPortalRepository } from '$lib/repositories/parent-portal.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const recipientId = url.searchParams.get('recipientId');
		if (!recipientId) throw error(400, 'recipientId query param wajib diisi');
		const studentId = url.searchParams.get('studentId') || undefined;

		const repo = new ParentPortalRepository(platform);
		const messages = await repo.getMessages(tenantId, recipientId, { studentId });
		return json({ success: true, data: messages });
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
		if (!body.senderId) throw error(400, 'senderId wajib diisi');
		if (!body.senderRole) throw error(400, 'senderRole wajib diisi');
		if (!body.recipientId) throw error(400, 'recipientId wajib diisi');
		if (!body.studentId) throw error(400, 'studentId wajib diisi');
		if (!body.body) throw error(400, 'body wajib diisi');

		const repo = new ParentPortalRepository(platform);
		const data = await repo.sendMessage(tenantId, {
			senderId: body.senderId,
			senderRole: body.senderRole,
			recipientId: body.recipientId,
			studentId: body.studentId,
			subject: body.subject,
			body: body.body,
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

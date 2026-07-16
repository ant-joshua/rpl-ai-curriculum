import { json, error } from '@sveltejs/kit';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

export async function PUT({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);
		const body = await request.json();

		let exception;

		if (body.action === 'approve') {
			exception = await repo.approveException(params.id, tenantId, user.id);
		} else if (body.action === 'reject') {
			exception = await repo.rejectException(params.id, tenantId, body.rejection_reason);
		} else {
			throw error(400, 'action harus "approve" atau "reject"');
		}

		if (!exception) {
			throw error(404, 'Exception not found atau sudah diproses');
		}

		return json({ success: true, data: exception });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

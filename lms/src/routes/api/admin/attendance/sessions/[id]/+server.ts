import { json, error } from '@sveltejs/kit';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

export async function GET({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);

		const session = await repo.getSession(params.id, tenantId);
		if (!session) {
			throw error(404, 'Session not found');
		}

		const records = await repo.getRecords(tenantId, params.id);

		return json({ success: true, data: { ...session, records } });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PUT({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);

		const session = await repo.closeSession(params.id, tenantId);
		if (!session) {
			throw error(404, 'Session not found');
		}

		return json({ success: true, data: session });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

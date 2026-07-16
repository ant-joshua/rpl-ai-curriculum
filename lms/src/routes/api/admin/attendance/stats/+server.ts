import { json, error } from '@sveltejs/kit';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id;
		if (!tenantId) throw error(400, 'Tenant ID required');

		const repo = new AttendanceSystemRepository(platform);
		const stats = await repo.getAttendanceStats(tenantId);

		return json({ success: true, data: stats });
	} catch (e: any) {
		if (e?.status) throw e;
		return json({ success: false, error: e?.message || 'Unknown error' }, { status: 500 });
	}
}

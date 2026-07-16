import { json, error } from '@sveltejs/kit';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);

		const sessionId = url.searchParams.get('session_id');
		const studentId = url.searchParams.get('student_id');
		const startDate = url.searchParams.get('start_date') || undefined;
		const endDate = url.searchParams.get('end_date') || undefined;

		// If student history requested
		if (studentId) {
			const records = await repo.getStudentHistory(tenantId, studentId, {
				startDate,
				endDate
			});
			return json({ success: true, data: records });
		}

		// If session records requested
		if (sessionId) {
			const records = await repo.getRecords(tenantId, sessionId);
			return json({ success: true, data: records });
		}

		throw error(400, 'session_id atau student_id wajib diisi');
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

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

		const classSubjectId = url.searchParams.get('class_subject_id') || undefined;
		const academicYear = url.searchParams.get('academic_year') || undefined;
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = parseInt(url.searchParams.get('limit') || '50', 10);

		const result = await repo.getSummaries(tenantId, {
			class_subject_id: classSubjectId,
			academic_year: academicYear,
			page,
			limit
		});

		return json({ success: true, data: result.summaries, total: result.total });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

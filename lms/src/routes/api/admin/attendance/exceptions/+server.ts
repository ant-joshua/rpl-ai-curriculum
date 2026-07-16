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

		const studentId = url.searchParams.get('student_id') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = parseInt(url.searchParams.get('limit') || '20', 10);

		const result = await repo.getExceptions(tenantId, {
			student_id: studentId,
			status,
			page,
			limit
		});

		return json({ success: true, data: result.exceptions, total: result.total });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	const user = locals.user;
	if (!user || !['admin', 'superadmin'].includes(user.role)) {
		throw error(403, 'Forbidden');
	}

	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);
		const body = await request.json();

		if (!body.student_id || !body.exception_type || !body.reason || !body.start_date || !body.end_date) {
			throw error(400, 'student_id, exception_type, reason, start_date, end_date wajib diisi');
		}

		const exception = await repo.createException(tenantId, {
			student_id: body.student_id,
			session_id: body.session_id,
			exception_type: body.exception_type,
			reason: body.reason,
			start_date: body.start_date,
			end_date: body.end_date,
			attachment_url: body.attachment_url
		});

		return json({ success: true, data: exception }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

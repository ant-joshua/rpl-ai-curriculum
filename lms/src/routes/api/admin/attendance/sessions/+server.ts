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
		const status = url.searchParams.get('status') || undefined;
		const date = url.searchParams.get('date') || undefined;
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const limit = parseInt(url.searchParams.get('limit') || '20', 10);

		const result = await repo.listSessions(tenantId, {
			class_subject_id: classSubjectId,
			status,
			date,
			page,
			limit
		});

		return json({ success: true, data: result.sessions, total: result.total });
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

		if (!body.class_subject_id || !body.academic_year || !body.semester) {
			throw error(400, 'class_subject_id, academic_year, dan semester wajib diisi');
		}

		const session = await repo.createSession(tenantId, {
			class_subject_id: body.class_subject_id,
			academic_year: body.academic_year,
			semester: body.semester,
			session_date: body.session_date,
			start_time: body.start_time,
			location_required: body.location_required,
			location_lat: body.location_lat,
			location_lng: body.location_lng,
			location_radius: body.location_radius,
			notes: body.notes
		}, user.id);

		return json({ success: true, data: session }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

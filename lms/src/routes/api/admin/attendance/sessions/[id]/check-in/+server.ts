import { json, error } from '@sveltejs/kit';
import { AttendanceSystemRepository } from '$lib/repositories/attendance-system.repository';

export async function POST({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		const tenantId = locals.tenant?.id || 'default';
		const repo = new AttendanceSystemRepository(platform);
		const body = await request.json();

		if (!body.student_id) {
			throw error(400, 'student_id wajib diisi');
		}

		const method = body.method || 'qr_scan';

		// If method is bulk, use bulk check-in
		if (body.records && Array.isArray(body.records)) {
			const records = await repo.bulkCheckIn(tenantId, params.id, body.records);
			return json({ success: true, data: records });
		}

		const record = await repo.checkIn(tenantId, {
			session_id: params.id,
			student_id: body.student_id,
			method,
			device_info: body.device_info,
			location_lat: body.location_lat,
			location_lng: body.location_lng
		});

		if (!record) {
			throw error(404, 'Session tidak aktif atau tidak ditemukan');
		}

		return json({ success: true, data: record });
	} catch (e: unknown) {
		if (e !== null && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { ExamSchedulerRepository } from '$lib/repositories/exam-scheduler.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const activeOnly = url.searchParams.get('active_only') === 'true';
		const data = await repo.getRooms(activeOnly);
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new ExamSchedulerRepository(db, tenantId);
		const body = await request.json();
		if (!body.name) throw error(400, 'Nama ruangan wajib diisi');
		if (!body.code) throw error(400, 'Kode ruangan wajib diisi');
		if (!body.capacity || body.capacity <= 0) throw error(400, 'Kapasitas ruangan harus lebih dari 0');
		const data = await repo.createRoom({
			name: body.name,
			code: body.code,
			capacity: body.capacity,
			building: body.building,
			floor: body.floor,
			facilities: body.facilities,
			is_active: body.is_active
		});
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

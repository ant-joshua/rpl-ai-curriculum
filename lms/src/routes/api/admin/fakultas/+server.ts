import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { UniversityRepository } from '$lib/repositories/university.repository';

export async function GET({ platform, locals }: { platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);
		const data = await repo.getFaculties();
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
		const repo = new UniversityRepository(db, tenantId);
		const body = await request.json();
		if (!body.name) throw error(400, 'Nama fakultas wajib diisi');
		const data = await repo.createFaculty({ name: body.name, code: body.code, dean_id: body.dean_id });
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

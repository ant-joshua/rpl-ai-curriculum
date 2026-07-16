import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { UniversityRepository } from '$lib/repositories/university.repository';

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);
		const data = await repo.getSemester(params.id);
		if (!data) throw error(404, 'Semester tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ params, request, platform, locals }: { params: { id: string }; request: Request; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);
		const body = await request.json();
		if (body.type && !['ganjil', 'genap', 'pendek'].includes(body.type)) throw error(400, 'type harus ganjil, genap, atau pendek');
		const data = await repo.updateSemester(params.id, body);
		if (!data) throw error(404, 'Semester tidak ditemukan');
		return json({ success: true, data });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

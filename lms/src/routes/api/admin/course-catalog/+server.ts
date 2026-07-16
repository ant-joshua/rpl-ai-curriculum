import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { UniversityRepository } from '$lib/repositories/university.repository';

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new UniversityRepository(db, tenantId);
		const studyProgramId = url.searchParams.get('study_program_id') || undefined;
		const data = await repo.getCourseCatalog({ studyProgramId });
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
		if (!body.study_program_id || !body.code || !body.name || !body.sks) {
			throw error(400, 'study_program_id, code, name, dan sks wajib diisi');
		}
		const data = await repo.createCourse(body);
		return json({ success: true, data }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { TutorRepository } from '$lib/repositories/tutor.repository';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function POST({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const result = await repo.completeSession(params.id);
		if (!result) throw error(404, 'Session not found');
		return json({ success: true, data: result });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

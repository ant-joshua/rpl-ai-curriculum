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

export async function GET({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const result = await repo.getSession(params.id);
		if (!result) throw error(404, 'Session not found');
		return json({ success: true, data: result });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		// Conflict check when time changes
		if (body.tutor_id && (body.date || body.start_time || body.end_time)) {
			const current = await repo.getSession(params.id);
			if (current?.tutor_id) {
				const conflict = await repo.checkConflict(
					body.tutor_id || current.tutor_id,
					body.date || current.date,
					body.start_time || current.start_time,
					body.end_time || current.end_time,
					params.id
				);
				if (conflict) throw error(409, 'Tutor already has a session at this time');
			}
		}

		const updated = await repo.updateSession(params.id, body);
		if (!updated) throw error(404, 'Session not found');
		return json({ success: true, data: updated });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function DELETE({ params, platform, locals }: { params: any; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const result = await repo.cancelSession(params.id);
		if (!result) throw error(404, 'Session not found');
		return json({ success: true, data: result });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

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

export async function GET({ params, url, platform, locals }: { params: any; url: URL; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);

		const studentId = url.searchParams.get('student_id') || undefined;
		const results = await repo.getSessionProgress(params.id, studentId);
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ params, request, platform, locals }: { params: any; request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const repo = new TutorRepository(db, tenantId);
		const body = await request.json();

		if (!body.student_id) {
			throw error(400, 'student_id required');
		}

		const validLevels = ['paham', 'cukup', 'kurang', 'tidak_paham'];
		if (body.understanding_level && !validLevels.includes(body.understanding_level)) {
			throw error(400, 'invalid understanding_level');
		}

		const result = await repo.saveSessionProgress({
			session_id: params.id,
			student_id: body.student_id,
			topic_covered: body.topic_covered || undefined,
			understanding_level: body.understanding_level || undefined,
			notes: body.notes || undefined,
			next_session_plan: body.next_session_plan || undefined,
			homework_given: body.homework_given || undefined,
			homework_completed: body.homework_completed ?? 0,
			created_by: locals.user?.id
		});

		return json({ success: true, data: result }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

import { json, error } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';

const ALLOWED_ROLES = ['superadmin', 'admin', 'instructor'];

function checkAuth(locals: any) {
	const user = locals.user;
	if (!user || !ALLOWED_ROLES.includes(user.role)) {
		throw error(403, 'Forbidden — admin/instructor role required');
	}
	return user;
}

export async function GET({ params, platform, locals }: { params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const { results } = await db.prepare(
			`SELECT sp.*, u.display_name
			 FROM session_progress sp
			 JOIN users u ON u.id = sp.student_id
			 WHERE sp.session_id = ? AND sp.tenant_id = ?
			 ORDER BY sp.created_at DESC`
		).bind(params.id, tenantId).all<any>();

		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const session = await db.prepare(
			'SELECT id, student_id FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!session) throw error(404, 'Session not found');

		const body = await request.json();
		const {
			student_id, topic_covered, understanding_level, notes,
			next_session_plan, homework_given, homework_completed
		} = body;

		if (!student_id) throw error(400, 'student_id required');

		const validLevels = ['paham', 'cukup', 'kurang', 'tidak_paham'];
		if (understanding_level && !validLevels.includes(understanding_level)) {
			throw error(400, 'invalid understanding_level');
		}

		// Upsert — one progress record per student per session
		const existing = await db.prepare(
			'SELECT id FROM session_progress WHERE session_id = ? AND student_id = ?'
		).bind(params.id, student_id).first<any>();

		const now = new Date().toISOString();

		if (existing) {
			await db.prepare(
				`UPDATE session_progress SET topic_covered=?, understanding_level=?, notes=?, next_session_plan=?, homework_given=?, homework_completed=?, created_by=?
				 WHERE id=?`
			).bind(
				topic_covered || null, understanding_level || null,
				notes || null, next_session_plan || null,
				homework_given || null, homework_completed ?? 0,
				locals.user.id, existing.id
			).run();
			return json({ success: true, data: { id: existing.id } });
		}

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO session_progress (id, tenant_id, session_id, student_id, topic_covered, understanding_level, notes, next_session_plan, homework_given, homework_completed, created_by, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, params.id, student_id,
			topic_covered || null, understanding_level || null,
			notes || null, next_session_plan || null,
			homework_given || null, homework_completed ?? 0,
			locals.user.id, now
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

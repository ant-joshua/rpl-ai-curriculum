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

export async function GET({ url, platform, locals }: { url: URL; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const tutorId = url.searchParams.get('tutor_id');
		const studentId = url.searchParams.get('student_id');
		const date = url.searchParams.get('date');
		const status = url.searchParams.get('status');

		let query = 'SELECT * FROM tutoring_sessions WHERE tenant_id = ?';
		const params: any[] = [tenantId];

		if (tutorId) { query += ' AND tutor_id = ?'; params.push(tutorId); }
		if (studentId) { query += ' AND student_id = ?'; params.push(studentId); }
		if (date) { query += ' AND date = ?'; params.push(date); }
		if (status) { query += ' AND status = ?'; params.push(status); }

		query += ' ORDER BY date DESC, start_time ASC';

		const { results } = await db.prepare(query).bind(...params).all<any>();
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const body = await request.json();

		const { tutor_id, student_id, type, title, date, start_time, end_time, room, notes, materials } = body;
		if (!tutor_id || !date || !start_time || !end_time) {
			throw error(400, 'tutor_id, date, start_time, end_time required');
		}

		const validTypes = ['privat_1on1', 'bimbel_kelas', 'kelompok_kecil', 'online', 'tryout'];
		if (type && !validTypes.includes(type)) {
			throw error(400, 'invalid session type');
		}

		// Check time conflict for same tutor
		const conflict = await db.prepare(
			`SELECT id FROM tutoring_sessions
			 WHERE tenant_id = ? AND tutor_id = ? AND date = ? AND status != 'cancelled'
			 AND ((start_time < ? AND end_time > ?))`
		).bind(tenantId, tutor_id, date, end_time, start_time).first<any>();

		if (conflict) {
			throw error(409, 'Schedule conflict — tutor already has a session in this time slot');
		}

		const startDt = new Date(`${date}T${start_time}`);
		const endDt = new Date(`${date}T${end_time}`);
		const durationMin = Math.round((endDt.getTime() - startDt.getTime()) / 60000);

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO tutoring_sessions (id, tenant_id, tutor_id, student_id, type, title, date, start_time, end_time, duration_minutes, room, status, notes, materials, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, tutor_id, student_id || null,
			type || 'privat_1on1', title || null, date, start_time, end_time,
			durationMin > 0 ? durationMin : null,
			room || null, 'scheduled', notes || null,
			materials ? JSON.stringify(materials) : null,
			now, now
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

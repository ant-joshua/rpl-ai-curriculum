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
			`SELECT sa.*, u.display_name, u.email, u.username
			 FROM session_attendance sa
			 JOIN users u ON u.id = sa.user_id
			 WHERE sa.session_id = ? AND sa.tenant_id = ?
			 ORDER BY u.display_name ASC`
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

		// Verify session exists
		const session = await db.prepare(
			'SELECT id FROM tutoring_sessions WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!session) throw error(404, 'Session not found');

		const body = await request.json();
		const { records } = body;
		if (!records || !Array.isArray(records) || records.length === 0) {
			throw error(400, 'records array required');
		}

		const now = new Date().toISOString();

		// Upsert attendance records in a batch
		const stmts = [];
		for (const rec of records) {
			const { user_id, status, time_in, minutes_late } = rec;
			if (!user_id || !status) continue;

			const existing = await db.prepare(
				'SELECT id FROM session_attendance WHERE session_id = ? AND user_id = ?'
			).bind(params.id, user_id).first<any>();

			if (existing) {
				stmts.push(
					db.prepare(
						'UPDATE session_attendance SET status = ?, time_in = ?, minutes_late = ?, recorded_by = ? WHERE id = ?'
					).bind(status, time_in || null, minutes_late ?? 0, locals.user.id, existing.id)
				);
			} else {
				const id = crypto.randomUUID();
				stmts.push(
					db.prepare(
						'INSERT INTO session_attendance (id, tenant_id, session_id, user_id, status, time_in, minutes_late, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
					).bind(id, tenantId, params.id, user_id, status, time_in || null, minutes_late ?? 0, locals.user.id)
				);
			}
		}

		if (stmts.length > 0) {
			await db.batch(stmts);
		}

		return json({ success: true });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

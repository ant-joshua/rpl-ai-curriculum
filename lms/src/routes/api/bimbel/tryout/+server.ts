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

		const batchId = url.searchParams.get('batch_id');

		let query = `
			SELECT tb.*,
				(SELECT COUNT(*) FROM tryout_participants tp WHERE tp.tryout_batch_id = tb.id) AS participant_count
			FROM tryout_batches tb
			WHERE tb.tenant_id = ?
		`;
		const params: any[] = [tenantId];

		if (batchId) {
			query += ' AND tb.batch_id = ?';
			params.push(batchId);
		}

		query += ' ORDER BY tb.date DESC';

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

		const { batch_id, title, date, duration_minutes, question_count, subjects } = body;
		if (!title) throw error(400, 'title required');

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			`INSERT INTO tryout_batches (id, tenant_id, batch_id, title, date, duration_minutes, question_count, subjects, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, tenantId, batch_id || null, title, date || null,
			duration_minutes ?? null, question_count ?? null,
			subjects ? JSON.stringify(subjects) : null, now
		).run();

		return json({ success: true, data: { id } }, { status: 201 });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

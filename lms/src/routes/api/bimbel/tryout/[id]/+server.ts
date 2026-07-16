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

		const tryout = await db.prepare(
			'SELECT * FROM tryout_batches WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!tryout) throw error(404, 'Tryout not found');

		// Participants with stats
		const { results: participants } = await db.prepare(
			`SELECT tp.*, u.display_name, u.email, u.username
			 FROM tryout_participants tp
			 JOIN users u ON u.id = tp.user_id
			 WHERE tp.tryout_batch_id = ?
			 ORDER BY COALESCE(tp.total_score, 0) DESC`
		).bind(params.id).all<any>();

		// Analysis summary
		const { results: analysis } = await db.prepare(
			'SELECT * FROM tryout_analysis WHERE tryout_batch_id = ?'
		).bind(params.id).all<any>();

		return json({
			success: true,
			data: {
				...tryout,
				participants: participants || [],
				analysis: analysis || [],
				participant_count: (participants || []).length,
				avg_score: participants?.length
					? participants.reduce((sum: number, p: any) => sum + (p.total_score || 0), 0) / participants.length
					: 0
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

export async function PATCH({ request, params, platform, locals }: { request: Request; params: { id: string }; platform: App.Platform; locals: any }) {
	try {
		checkAuth(locals);
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const existing = await db.prepare(
			'SELECT * FROM tryout_batches WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!existing) throw error(404, 'Tryout not found');

		const body = await request.json();
		const merged = { ...existing, ...body };

		await db.prepare(
			`UPDATE tryout_batches SET batch_id=?, title=?, date=?, duration_minutes=?, question_count=?, subjects=?
			 WHERE id=?`
		).bind(
			merged.batch_id, merged.title, merged.date,
			merged.duration_minutes, merged.question_count,
			merged.subjects ? (typeof merged.subjects === 'string' ? merged.subjects : JSON.stringify(merged.subjects)) : null,
			params.id
		).run();

		return json({ success: true, data: merged });
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

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

		// Verify tryout exists
		const tryout = await db.prepare(
			'SELECT id, title, question_count FROM tryout_batches WHERE id = ? AND tenant_id = ?'
		).bind(params.id, tenantId).first<any>();
		if (!tryout) throw error(404, 'Tryout not found');

		const { results } = await db.prepare(
			`SELECT tp.*, u.display_name, u.email, u.username, u.avatar_url
			 FROM tryout_participants tp
			 JOIN users u ON u.id = tp.user_id
			 WHERE tp.tryout_batch_id = ?
			 ORDER BY tp.rank ASC NULLS LAST, tp.total_score DESC NULLS LAST`
		).bind(params.id).all<any>();

		return json({
			success: true,
			data: {
				tryout: { id: tryout.id, title: tryout.title, question_count: tryout.question_count },
				rankings: results || []
			}
		});
	} catch (e: unknown) {
		if (e !== null && typeof e === "object" && "status" in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, { status: 500 });
	}
}

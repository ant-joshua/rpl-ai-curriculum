import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const users = await db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 100').all();
		const enriched = await Promise.all((users.results || []).map(async (u: any) => {
			const xpRow = await db.prepare('SELECT COALESCE(total_xp, 0) as xp, level FROM user_xp WHERE user_id = ?').bind(u.id).first<{ xp: number; level: number }>();
			const progressCount = await db.prepare('SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = 1').bind(u.id).first<{ count: number }>();
			const projectsDone = await db.prepare('SELECT COUNT(*) as count FROM project_completions WHERE user_id = ?').bind(u.id).first<{ count: number }>();
			return {
				...u,
				xp: xpRow?.xp || 0,
				level: xpRow?.level || 1,
				completed_sessions: progressCount?.count || 0,
				completed_projects: projectsDone?.count || 0,
			};
		}));
		return jsonResponse({ success: true, data: enriched });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

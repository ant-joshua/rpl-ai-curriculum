import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/gamification/boost/active — active XP boost events for this tenant */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results } = await db.prepare(`
			SELECT id, title, multiplier, reason_filter, start_at, end_at
			FROM xp_boost_events
			WHERE enabled = 1 AND datetime('now') BETWEEN start_at AND end_at
				AND (tenant_id IS NULL OR tenant_id = ?)
			ORDER BY multiplier DESC
		`).bind(locals?.tenant?.id ?? '').all<any>();
		return jsonResponse({ success: true, data: (results || []).map((r: any) => ({
			id: r.id,
			title: r.title,
			multiplier: r.multiplier,
			reasonFilter: r.reason_filter,
			startAt: r.start_at,
			endAt: r.end_at,
		})) });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/admin/gamification/boosts — list all XP boost events */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const includePast = url.searchParams.get('include_past') === '1';
		let { results } = await db.prepare(`
			SELECT * FROM xp_boost_events
			${includePast ? '' : `WHERE end_at >= datetime('now')`}
			ORDER BY start_at DESC
			LIMIT 50
		`).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/admin/gamification/boosts — create XP boost event */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { title, multiplier, reason_filter = 'all', tenant_id = null, start_at, end_at, enabled = 1 } = body;

		if (!title || !multiplier || multiplier <= 1) {
			return jsonResponse({ success: false, error: 'title dan multiplier (>1) wajib' }, 400);
		}
		if (!start_at || !end_at) {
			return jsonResponse({ success: false, error: 'start_at dan end_at wajib' }, 400);
		}

		await db.prepare(
			`INSERT INTO xp_boost_events (id, title, multiplier, reason_filter, tenant_id, start_at, end_at, enabled)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(crypto.randomUUID(), title, multiplier, reason_filter, tenant_id, start_at, end_at, enabled).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

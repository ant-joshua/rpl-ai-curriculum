import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/admin/gamification/quest-config — list all quest configs */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results: configs } = await db.prepare(
			`SELECT quest_key, target, xp_reward, enabled, updated_at
			 FROM quest_config ORDER BY quest_key`
		).all<any>();

		return jsonResponse({ success: true, data: configs || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** PUT /api/admin/gamification/quest-config — upsert a quest config */
export async function PUT({ request, platform, locals }: { request: Request; platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const body = await request.json();
		const { questKey, target, xpReward, enabled } = body;

		if (!questKey) return jsonResponse({ success: false, error: 'questKey required' }, 400);
		if (typeof target !== 'number' || target < 1) return jsonResponse({ success: false, error: 'target must be >= 1' }, 400);
		if (typeof xpReward !== 'number' || xpReward < 0) return jsonResponse({ success: false, error: 'xpReward must be >= 0' }, 400);

		const db = getDB(platform);
		await db.prepare(
			`INSERT INTO quest_config (quest_key, target, xp_reward, enabled, updated_at)
			 VALUES (?, ?, ?, ?, datetime('now'))
			 ON CONFLICT (quest_key) DO UPDATE SET
			   target = excluded.target,
			   xp_reward = excluded.xp_reward,
			   enabled = excluded.enabled,
			   updated_at = datetime('now')`
		).bind(questKey, target, xpReward, enabled ? 1 : 0).run();

		return jsonResponse({ success: true, data: { questKey, target, xpReward, enabled: !!enabled } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

/** PATCH /api/admin/gamification/boosts/[id] — update boost event */
export async function PATCH({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		const body = await request.json();

		const fields: string[] = [];
		const values: (string | number)[] = [];
		for (const key of ['title', 'multiplier', 'reason_filter', 'tenant_id', 'start_at', 'end_at', 'enabled']) {
			if (body[key] !== undefined) {
				fields.push(`${key} = ?`);
				values.push(body[key]);
			}
		}
		if (fields.length === 0) return jsonResponse({ success: false, error: 'Tidak ada field untuk diupdate' }, 400);

		values.push(id as string);
		await db.prepare(`UPDATE xp_boost_events SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** DELETE /api/admin/gamification/boosts/[id] */
export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		await db.prepare('DELETE FROM xp_boost_events WHERE id = ?').bind(id as string).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

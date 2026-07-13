import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' } });
}

export async function POST({ params, request, platform }: { params: { slug: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body = await request.json() as { title?: string };
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

		const compId = `comp-${deviceId}-${params.slug}`;
		await db.prepare('INSERT OR IGNORE INTO project_completions (id, user_id, project_slug, title, completed_at) VALUES (?, ?, ?, ?, ?)')
			.bind(compId, deviceId, params.slug, body.title || '', now).run();

		// Update progress completed_at
		await db.prepare('UPDATE project_progress SET completed_at = ?, current_step = 999 WHERE user_id = ? AND project_slug = ?')
			.bind(now, deviceId, params.slug).run();

		// Award 50 XP
		const existingXp = await db.prepare('SELECT xp FROM user_xp WHERE user_id = ?').bind(deviceId).first<{ xp: number }>();
		if (existingXp) {
			await db.prepare('UPDATE user_xp SET xp = xp + 50, updated_at = ? WHERE user_id = ?').bind(now, deviceId).run();
		} else {
			await db.prepare('INSERT INTO user_xp (id, user_id, xp, level, updated_at) VALUES (?, ?, 50, 1, ?)').bind(`xp-${deviceId}`, deviceId, now).run();
		}

		return json({ success: true, xp_awarded: 50 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

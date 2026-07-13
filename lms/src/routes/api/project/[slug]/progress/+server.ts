import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' } });
}

export async function GET({ params, request, platform }: { params: { slug: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const row = await db
			.prepare('SELECT * FROM project_progress WHERE user_id = ? AND project_slug = ?')
			.bind(deviceId, params.slug)
			.first();
		return json({ success: true, data: row || null });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ params, request, platform }: { params: { slug: string }; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body = await request.json() as { current_step?: number; completed_steps?: number[]; code_state?: Record<string, string> };
		const id = `prog-${deviceId}-${params.slug}`;
		const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
		const existing = await db.prepare('SELECT id FROM project_progress WHERE user_id = ? AND project_slug = ?').bind(deviceId, params.slug).first();
		if (existing) {
			await db.prepare('UPDATE project_progress SET current_step = ?, completed_steps = ?, code_state = ?, started_at = COALESCE(started_at, ?) WHERE user_id = ? AND project_slug = ?')
				.bind(body.current_step ?? 0, JSON.stringify(body.completed_steps ?? []), JSON.stringify(body.code_state ?? {}), now, deviceId, params.slug)
				.run();
		} else {
			await db.prepare('INSERT INTO project_progress (id, user_id, project_slug, current_step, completed_steps, code_state, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
				.bind(id, deviceId, params.slug, body.current_step ?? 0, JSON.stringify(body.completed_steps ?? []), JSON.stringify(body.code_state ?? {}), now)
				.run();
		}
		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

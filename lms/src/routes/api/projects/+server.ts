import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, x-device-id' } });
}

export async function GET({ platform, request }: { platform: App.Platform; request: Request }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);

		const rows = await db.prepare(
			'SELECT pp.*, pc.completed_at as project_completed_at FROM project_progress pp LEFT JOIN project_completions pc ON pc.user_id = pp.user_id AND pc.project_slug = pp.project_slug WHERE pp.user_id = ? ORDER BY pp.project_slug'
		).bind(deviceId).all();

		return json({ success: true, data: rows.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

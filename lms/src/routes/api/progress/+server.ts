import type { D1Database } from '@cloudflare/workers-types';
import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);

		const { results } = await db
			.prepare('SELECT * FROM progress WHERE user_id = ? ORDER BY updated_at DESC')
			.bind(deviceId)
			.all<{ id: string; user_id: string; module_slug: string; session_id: string; completed: number; completed_at: string | null; created_at: string; updated_at: string }>();

		return json({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; module_slug?: string; session_id?: string; completed?: number } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { module_slug, session_id, completed = 1 } = body;

		if (!module_slug || !session_id) {
			return json({ success: false, error: 'module_slug and session_id required' }, 400);
		}

		const id = `progress-${deviceId}-${module_slug}-${session_id}`;
		const now = new Date().toISOString();
		const completedAt = completed ? now : null;

		await db
			.prepare(
				`INSERT INTO progress (id, user_id, module_slug, session_id, completed, completed_at, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(user_id, module_slug, session_id)
				 DO UPDATE SET completed = ?, completed_at = ?, updated_at = ?`
			)
			.bind(id, deviceId, module_slug, session_id, completed, completedAt, now, now, completed, completedAt, now)
			.run();

		return json({ success: true, data: { id, completed } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; module_slug?: string; session_id?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { module_slug, session_id } = body;

		if (!module_slug || !session_id) {
			return json({ success: false, error: 'module_slug and session_id required' }, 400);
		}

		await db
			.prepare('DELETE FROM progress WHERE user_id = ? AND module_slug = ? AND session_id = ?')
			.bind(deviceId, module_slug, session_id)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

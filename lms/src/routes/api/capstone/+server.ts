import { getDB, getDeviceId } from '$lib/server/d1';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
		const deviceId = getDeviceId(request);
		const { results } = await db
			.prepare('SELECT * FROM capstone_projects WHERE user_id = ? ORDER BY created_at DESC')
			.bind(deviceId)
			.all<any>();
		return json({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body = await request.json() as {
			path_slug: string;
			title: string;
			description: string;
			repo_url?: string;
		};

		if (!body.path_slug || !body.title || !body.description) {
			return json({ success: false, error: 'path_slug, title, and description required' }, 400);
		}

		const id = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

		await db
			.prepare(
				'INSERT INTO capstone_projects (id, user_id, path_slug, title, description, repo_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, deviceId, body.path_slug, body.title, body.description, body.repo_url || null, 'draft', now)
			.run();

		return json({ success: true, data: { id } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);
		const body = await request.json() as {
			id: string;
			title?: string;
			description?: string;
			repo_url?: string;
			status?: string;
		};

		if (!body.id) {
			return json({ success: false, error: 'id required' }, 400);
		}

		const existing = await db
			.prepare('SELECT * FROM capstone_projects WHERE id = ? AND user_id = ?')
			.bind(body.id, deviceId)
			.first<any>();

		if (!existing) {
			return json({ success: false, error: 'Project not found' }, 404);
		}

		const updates: string[] = [];
		const values: any[] = [];

		if (body.title !== undefined) { updates.push('title = ?'); values.push(body.title); }
		if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
		if (body.repo_url !== undefined) { updates.push('repo_url = ?'); values.push(body.repo_url); }
		if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status); }

		if (updates.length === 0) {
			return json({ success: false, error: 'No fields to update' }, 400);
		}

		values.push(body.id);
		await db
			.prepare(`UPDATE capstone_projects SET ${updates.join(', ')} WHERE id = ?`)
			.bind(...values)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

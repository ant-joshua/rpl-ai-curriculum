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
		const moduleSlug = url.searchParams.get('module_slug');
		const sessionId = url.searchParams.get('session_id');

		if (!moduleSlug) {
			return json({ success: false, error: 'module_slug required' }, 400);
		}

		let query = 'SELECT * FROM discussions WHERE module_slug = ?';
		const params: (string | null)[] = [moduleSlug];

		if (sessionId) {
			query += ' AND session_id = ?';
			params.push(sessionId);
		}

		query += ' ORDER BY created_at ASC';

		const { results } = await db
			.prepare(query)
			.bind(...params)
			.all<{
				id: string; module_slug: string; session_id: string | null;
				user_id: string; content: string; parent_id: string | null;
				created_at: string; updated_at: string;
			}>();

		// Fetch usernames for each unique user_id
		const userIds = [...new Set(results.map(r => r.user_id))];
		const userMap: Record<string, string> = {};
		if (userIds.length > 0) {
			for (const uid of userIds) {
				const user = await db
					.prepare('SELECT username FROM users WHERE id = ?')
					.bind(uid)
					.first<{ username: string }>();
				userMap[uid] = user?.username || uid.slice(0, 8);
			}
		}

		// Build threaded structure
		const comments = results.map(r => ({
			...r,
			username: userMap[r.user_id] || r.user_id.slice(0, 8),
		}));

		return json({ success: true, data: comments, users: userMap });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: {
			device_id?: string;
			module_slug?: string;
			session_id?: string;
			content?: string;
			parent_id?: string;
		} = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { module_slug, session_id, content, parent_id } = body;

		if (!module_slug || !content) {
			return json({ success: false, error: 'module_slug and content required' }, 400);
		}

		const id = `disc-${deviceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const now = new Date().toISOString();

		await db
			.prepare(
				'INSERT INTO discussions (id, module_slug, session_id, user_id, content, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(id, module_slug, session_id || null, deviceId, content, parent_id || null, now, now)
			.run();

		return json({ success: true, data: { id, module_slug, session_id, user_id: deviceId, content, parent_id: parent_id || null, created_at: now, updated_at: now } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body: { device_id?: string; id?: string } = await request.json();
		const deviceId = body.device_id || getDeviceId(request);
		const { id } = body;

		if (!id) {
			return json({ success: false, error: 'id required' }, 400);
		}

		// Only allow deleting own comments
		const existing = await db
			.prepare('SELECT * FROM discussions WHERE id = ? AND user_id = ?')
			.bind(id, deviceId)
			.first();

		if (!existing) {
			return json({ success: false, error: 'Not found or not yours' }, 404);
		}

		// Delete replies too
		await db
			.prepare('DELETE FROM discussions WHERE id = ? OR parent_id = ?')
			.bind(id, id)
			.run();

		return json({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

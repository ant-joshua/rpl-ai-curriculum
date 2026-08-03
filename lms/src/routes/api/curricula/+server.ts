import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/curricula — list curricula (public: active only; admin: all)
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Check if admin (optional auth)
		let isAdmin = false;
		const token = getTokenFromRequest(request);
		if (token) {
			const session = await getSession(platform, token).catch(() => null);
			if (session && (session.user.role === 'admin' || session.user.role === 'superadmin')) isAdmin = true;
		}

		const sql = isAdmin
			? 'SELECT * FROM curricula ORDER BY is_default DESC, created_at ASC'
			: 'SELECT id, name, slug, type, description, authority, is_default FROM curricula WHERE is_active = 1 ORDER BY is_default DESC, name ASC';

		const { results } = await db.prepare(sql).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

// POST /api/curricula — create curriculum (admin only)
// Body: { name, slug?, type, description?, authority?, is_default? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);
		if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
			return jsonResponse({ success: false, error: 'Admin only' }, 403);
		}

		const db = getDB(platform);
		const body = await request.json();
		const { name, slug, type, description, authority, is_default, metadata } = body;
		if (!name?.trim()) return jsonResponse({ success: false, error: 'Name required' }, 400);

		const id = crypto.randomUUID();
		const slugFinal = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

		if (is_default) {
			await db.prepare('UPDATE curricula SET is_default = 0').run();
		}

		await db.prepare(
			`INSERT INTO curricula (id, name, slug, type, description, authority, is_default, is_active, metadata)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`
		).bind(
			id, name.trim(), slugFinal, type || 'custom',
			description || '', authority || 'sekolah',
			is_default ? 1 : 0, JSON.stringify(metadata || {})
		).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

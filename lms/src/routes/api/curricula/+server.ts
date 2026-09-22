import { getDB } from '$lib/server/d1';
import { cachedDbQuery, invalidateCache } from '$lib/server/cache';
import { apiOk, apiError, authenticateRequest, requireRole, parseJson } from '$lib/server/api';

// GET /api/curricula — list curricula (public: active only; admin: all)
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Check if admin (optional auth)
		let isAdmin = false;
		if (locals?.user && ['admin', 'superadmin'].includes(locals.user.role)) {
			isAdmin = true;
		} else {
			const auth = await authenticateRequest(locals, request, platform).catch(() => null);
			if (auth?.user && ['admin', 'superadmin'].includes(auth.user.role)) {
				isAdmin = true;
			}
		}

		const sql = isAdmin
			? 'SELECT * FROM curricula ORDER BY is_default DESC, created_at ASC'
			: 'SELECT id, name, slug, type, description, authority, is_default FROM curricula WHERE is_active = 1 ORDER BY is_default DESC, name ASC';

		const { results } = await cachedDbQuery<any>(db, sql, [], 60_000);
		return apiOk(results || []);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

// POST /api/curricula — create curriculum (admin only)
// Body: { name, slug?, type, description?, authority?, is_default? }
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const roleCheck = requireRole(locals, ['admin', 'superadmin']);
		if (roleCheck.response && !['admin', 'superadmin'].includes(auth.user.role)) {
			return apiError('Admin only', 403);
		}

		const parsed = await parseJson<any>(request);
		if (parsed.response) return parsed.response;

		const { name, slug, type, description, authority, is_default, metadata } = parsed.data || {};
		if (!name?.trim()) return apiError('Name required', 400);

		const db = getDB(platform);
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

		// Invalidate cached curricula
		invalidateCache('SELECT');

		return apiOk({ id }, { status: 201 });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

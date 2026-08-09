import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

// Search users to start a new conversation (excludes self)
export async function GET({ url, request, platform }: { url: URL; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const q = (url.searchParams.get('q') || '').trim();
		if (q.length < 2) return jsonResponse({ success: true, data: [] });

		const db = getDB(platform);
		const userId = session.user.id;
		const like = `%${q}%`;

		const results = await db
			.prepare(`
				SELECT id, display_name, username, role
				FROM users
				WHERE id != ?
				  AND (display_name LIKE ? OR username LIKE ? OR email LIKE ?)
				ORDER BY display_name ASC
				LIMIT 15
			`)
			.bind(userId, like, like, like)
			.all();

		return jsonResponse({
			success: true,
			data: (results.results || []).map((u: any) => ({
				id: u.id,
				name: u.display_name || u.username || u.id,
				role: u.role,
			})),
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

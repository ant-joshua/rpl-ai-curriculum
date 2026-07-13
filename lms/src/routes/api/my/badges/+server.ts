import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);
		const userId = session.session.user_id;

		const result = await db.prepare(
			`SELECT b.*, ub.unlocked_at AS earned_at
			 FROM badges b
			 LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
			 ORDER BY ub.unlocked_at DESC, b.name ASC`
		).bind(userId).all();

		return jsonResponse({ success: true, data: result.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

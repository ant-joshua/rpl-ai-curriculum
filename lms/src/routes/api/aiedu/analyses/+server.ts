import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/analyze — list analysis history (mine)
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const { results } = await db.prepare(
			'SELECT id, subject, grade, created_at FROM aiedu_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
		).bind(session.user.id).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

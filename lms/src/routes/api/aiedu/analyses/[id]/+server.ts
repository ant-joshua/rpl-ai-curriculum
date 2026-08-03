import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/analyses/[id] — analysis detail + output
export async function GET({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const analysis = await db.prepare(
			'SELECT * FROM aiedu_analyses WHERE id = ? AND user_id = ?'
		).bind(params.id, session.user.id).first<any>();
		if (!analysis) return jsonResponse({ success: false, error: 'Analysis not found' }, 404);

		return jsonResponse({ success: true, data: analysis });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

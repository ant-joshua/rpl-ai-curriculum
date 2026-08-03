import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// GET /api/aiedu/generations — list my generation history
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT g.id, g.doc_type, g.subject, g.status, g.created_at, g.input,
			        c.name AS curriculum_name
			 FROM aiedu_generations g
			 LEFT JOIN curricula c ON c.id = json_extract(g.input, '$.curriculum_id')
			 WHERE g.user_id = ?
			 ORDER BY g.created_at DESC LIMIT 50`
		).bind(session.user.id).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

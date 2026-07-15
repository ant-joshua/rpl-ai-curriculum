import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** POST /api/activity/log — log an activity (called from client hooks, fire-and-forget) */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const body: {
			activity_type: string;
			description: string;
			offering_id?: string;
			reference_type?: string;
			reference_id?: string;
			metadata?: Record<string, unknown>;
		} = await request.json();

		if (!body.activity_type || !body.description) {
			return jsonResponse({ success: false, error: 'activity_type and description are required' }, 400);
		}

		const validTypes = ['lesson_complete', 'assignment_submit', 'discussion_post', 'enrolled', 'certificate_earned', 'assessment_done'];
		if (!validTypes.includes(body.activity_type)) {
			return jsonResponse({ success: false, error: `Invalid activity_type. Must be one of: ${validTypes.join(', ')}` }, 400);
		}

		const id = crypto.randomUUID();
		const metadata = body.metadata ? JSON.stringify(body.metadata) : null;

		await db.prepare(
			`INSERT INTO activity_feed (id, offering_id, user_id, activity_type, description, reference_type, reference_id, metadata, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id,
			body.offering_id || null,
			userId,
			body.activity_type,
			body.description,
			body.reference_type || null,
			body.reference_id || null,
			metadata
		).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

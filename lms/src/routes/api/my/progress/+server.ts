import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}
		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);

		const body: { lessonSlug?: string; courseOfferingId?: string; completed?: boolean; timeSpent?: number } = await request.json();

		if (!body.lessonSlug || !body.courseOfferingId || body.completed === undefined) {
			return jsonResponse({ success: false, error: 'lessonSlug, courseOfferingId, and completed are required' }, 400);
		}

		const now = new Date().toISOString();
		const completedInt = body.completed ? 1 : 0;
		const timeSpent = body.timeSpent ?? 0;
		const id = `progress-${userId}-${body.courseOfferingId}-${body.lessonSlug}`;

		await db
			.prepare(
				`INSERT INTO progress (id, user_id, module_slug, session_id, completed, completed_at, time_spent, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				 ON CONFLICT(user_id, module_slug, session_id)
				 DO UPDATE SET completed = ?, completed_at = COALESCE(?, completed_at), time_spent = ?, updated_at = ?`
			)
			.bind(
				id,
				userId,
				body.courseOfferingId,
				body.lessonSlug,
				completedInt,
				body.completed ? now : null,
				timeSpent,
				now,
				now,
				completedInt,
				body.completed ? now : null,
				timeSpent,
				now
			)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}
		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId query parameter required' }, 400);
		}

		const { results } = await db
			.prepare(
				`SELECT session_id, completed, completed_at, time_spent
				 FROM progress
				 WHERE user_id = ? AND module_slug = ? AND completed = 1
				 ORDER BY updated_at DESC`
			)
			.bind(userId, offeringId)
			.all<{ session_id: string; completed: number; completed_at: string | null; time_spent: number }>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

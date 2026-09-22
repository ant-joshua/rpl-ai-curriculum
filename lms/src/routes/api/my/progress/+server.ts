import { getDB } from '$lib/server/d1';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const parsed = await parseJson<{ lessonSlug?: string; courseOfferingId?: string; completed?: boolean; timeSpent?: number }>(request);
		if (parsed.response) return parsed.response;

		const body = parsed.data || {};
		if (!body.lessonSlug || !body.courseOfferingId || body.completed === undefined) {
			return apiError('lessonSlug, courseOfferingId, and completed are required', 400);
		}

		const db = getDB(platform);
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

		return apiOk({ updated: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		if (!offeringId) {
			return apiError('offeringId query parameter required', 400);
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

		return apiOk(results || []);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

import { getDB } from '$lib/server/d1';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

/**
 * POST /api/my/bookmarks — toggle bookmark for a lesson
 * Body: { lessonId, moduleSlug?, sessionId? }
 * Returns { bookmarked: boolean }
 */
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const parsed = await parseJson<{ lessonId?: string; moduleSlug?: string; sessionId?: string }>(request);
		if (parsed.response) return parsed.response;

		const { lessonId, moduleSlug, sessionId } = parsed.data || {};
		if (!lessonId) {
			return apiError('lessonId is required', 400);
		}

		const db = getDB(platform);

		// Check if bookmark exists
		const existing = await db
			.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND lesson_id = ?')
			.bind(userId, lessonId)
			.first<{ id: string }>();

		if (existing) {
			// Toggle off — delete
			await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(existing.id).run();
			return apiOk({ bookmarked: false });
		}

		// Toggle on — insert
		const id = `bm-${userId}-${lessonId}`;
		const now = new Date().toISOString();
		const slug = sessionId || '';
		const modSlug = moduleSlug || '';
		await db
			.prepare(
				'INSERT INTO bookmarks (id, user_id, lesson_id, module_slug, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(id, userId, lessonId, modSlug, slug, now)
			.run();

		return apiOk({ bookmarked: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * GET /api/my/bookmarks — list bookmarked lessons
 * Query: ?offeringId=X (optional filter)
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		let query: string;
		let bindings: string[];

		if (offeringId) {
			query = `
				SELECT b.*, l.title AS lesson_title, l.slug AS lesson_slug, l.duration_minutes,
				       co.name AS offering_name, co.id AS offering_id
				FROM bookmarks b
				JOIN lessons l ON l.id = b.lesson_id
				JOIN course_offerings co ON co.id = l.course_offering_id
				WHERE b.user_id = ? AND l.course_offering_id = ?
				ORDER BY b.created_at DESC
			`;
			bindings = [userId, offeringId];
		} else {
			query = `
				SELECT b.*, l.title AS lesson_title, l.slug AS lesson_slug, l.duration_minutes,
				       co.name AS offering_name, co.id AS offering_id
				FROM bookmarks b
				JOIN lessons l ON l.id = b.lesson_id
				JOIN course_offerings co ON co.id = l.course_offering_id
				WHERE b.user_id = ?
				ORDER BY b.created_at DESC
			`;
			bindings = [userId];
		}

		const { results } = await db.prepare(query).bind(...bindings).all();
		return apiOk(results || []);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

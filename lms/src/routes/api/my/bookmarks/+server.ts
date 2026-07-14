import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * POST /api/my/bookmarks — toggle bookmark for a lesson
 * Body: { lessonId, moduleSlug?, sessionId? }
 * Returns { bookmarked: boolean }
 */
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
		const body: { lessonId?: string; moduleSlug?: string; sessionId?: string } = await request.json();
		const { lessonId, moduleSlug, sessionId } = body;

		if (!lessonId) {
			return jsonResponse({ success: false, error: 'lessonId is required' }, 400);
		}

		// Check if bookmark exists
		const existing = await db
			.prepare('SELECT id FROM bookmarks WHERE user_id = ? AND lesson_id = ?')
			.bind(userId, lessonId)
			.first<{ id: string }>();

		if (existing) {
			// Toggle off — delete
			await db.prepare('DELETE FROM bookmarks WHERE id = ?').bind(existing.id).run();
			return jsonResponse({ success: true, data: { bookmarked: false } });
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

		return jsonResponse({ success: true, data: { bookmarked: true } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * GET /api/my/bookmarks — list bookmarked lessons
 * Query: ?offeringId=X (optional filter)
 */
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
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

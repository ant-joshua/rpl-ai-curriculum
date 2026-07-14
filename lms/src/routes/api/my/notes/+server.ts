import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

/**
 * GET /api/my/notes?lessonId=X
 * Returns the user's note for a given lesson, or all notes if no lessonId.
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
		const lessonId = url.searchParams.get('lessonId');

		if (lessonId) {
			// Return note for specific lesson
			const note = await db
				.prepare('SELECT * FROM notes WHERE user_id = ? AND lesson_id = ?')
				.bind(userId, lessonId)
				.first<{ id: string; user_id: string; lesson_id: string; module_slug: string; session_id: string; content: string; created_at: string; updated_at: string }>();
			return jsonResponse({ success: true, data: note || null });
		}

		// Return all notes with lesson titles for reference
		const { results } = await db
			.prepare(`
				SELECT n.*, l.title AS lesson_title, l.slug AS lesson_slug
				FROM notes n
				LEFT JOIN lessons l ON l.id = n.lesson_id
				WHERE n.user_id = ?
				ORDER BY n.updated_at DESC
			`)
			.bind(userId)
			.all();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * POST /api/my/notes
 * Create or update a note for a lesson.
 * Body: { lessonId, content, moduleSlug?, sessionId? }
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
		const body: { lessonId?: string; content?: string; moduleSlug?: string; sessionId?: string } = await request.json();
		const { lessonId, content = '', moduleSlug, sessionId } = body;

		if (!lessonId) {
			return jsonResponse({ success: false, error: 'lessonId is required' }, 400);
		}

		const now = new Date().toISOString();

		// Check existing note for this user + lesson
		const existing = await db
			.prepare('SELECT id FROM notes WHERE user_id = ? AND lesson_id = ?')
			.bind(userId, lessonId)
			.first<{ id: string }>();

		if (existing) {
			// Update
			await db
				.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?')
				.bind(content, now, existing.id)
				.run();
			return jsonResponse({ success: true, data: { id: existing.id, content, updatedAt: now } });
		}

		// Insert new
		const id = `note-${userId}-${lessonId}`;
		const slug = sessionId || '';
		const modSlug = moduleSlug || '';
		await db
			.prepare(
				`INSERT INTO notes (id, user_id, lesson_id, module_slug, session_id, content, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(id, userId, lessonId, modSlug, slug, content, now, now)
			.run();

		return jsonResponse({ success: true, data: { id, content } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

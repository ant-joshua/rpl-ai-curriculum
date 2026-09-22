import { getDB } from '$lib/server/d1';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

/**
 * GET /api/my/notes?lessonId=X
 * Returns the user's note for a given lesson, or all notes if no lessonId.
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const db = getDB(platform);
		const url = new URL(request.url);
		const lessonId = url.searchParams.get('lessonId');

		if (lessonId) {
			// Return note for specific lesson
			const note = await db
				.prepare('SELECT * FROM notes WHERE user_id = ? AND lesson_id = ?')
				.bind(userId, lessonId)
				.first<{ id: string; user_id: string; lesson_id: string; module_slug: string; session_id: string; content: string; created_at: string; updated_at: string }>();
			return apiOk(note || null);
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
		return apiOk(results || []);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * POST /api/my/notes
 * Create or update a note for a lesson.
 * Body: { lessonId, content, moduleSlug?, sessionId? }
 */
export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const parsed = await parseJson<{ lessonId?: string; content?: string; moduleSlug?: string; sessionId?: string }>(request);
		if (parsed.response) return parsed.response;

		const { lessonId, content = '', moduleSlug, sessionId } = parsed.data || {};
		if (!lessonId) {
			return apiError('lessonId is required', 400);
		}

		const db = getDB(platform);
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
			return apiOk({ id: existing.id, content, updatedAt: now });
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

		return apiOk({ id, content });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

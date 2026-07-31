import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

/**
 * Practice queue — questions answered wrong are stored here
 * and surfaced again until answered correctly (mastery loop).
 */

/** GET /api/practice/queue — pending items for the user */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;

		const { results: items } = await db.prepare(
			`SELECT id, block_id, question_ref, prompt, correct_answer, wrong_count, practiced_count
			 FROM practice_queue
			 WHERE user_id = ? AND mastered = 0
			 ORDER BY last_wrong_at DESC
			 LIMIT 50`
		).bind(userId).all<any>();

		return jsonResponse({ success: true, data: items || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/practice/queue — add a wrong answer to the queue */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { blockId, questionRef, prompt, correctAnswer } = body;

		if (!blockId || !prompt || !correctAnswer) {
			return jsonResponse({ success: false, error: 'blockId, prompt, correctAnswer required' }, 400);
		}

		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO practice_queue (id, user_id, block_id, question_ref, prompt, correct_answer)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT (user_id, block_id, question_ref) DO UPDATE SET
			   wrong_count = wrong_count + 1,
			   last_wrong_at = datetime('now'),
			   mastered = 0`
		).bind(id, userId, blockId, questionRef || null, prompt, correctAnswer).run();

		return jsonResponse({ success: true, data: { queued: true } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** PUT /api/practice/queue — mark a question as mastered (answered correctly) */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { id } = body;

		if (!id) return jsonResponse({ success: false, error: 'id required' }, 400);

		await db.prepare(
			`UPDATE practice_queue SET mastered = 1, practiced_count = practiced_count + 1
			 WHERE id = ? AND user_id = ?`
		).bind(id, userId).run();

		return jsonResponse({ success: true, data: { mastered: true } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

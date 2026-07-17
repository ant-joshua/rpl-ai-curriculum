import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

/**
 * POST /api/chat/send — send a chat message
 * Body: { offeringId: string, message: string }
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		const userId = session.user.id;

		const body = await request.json();
		if (!body.offeringId || !body.message) {
			return jsonResponse({ success: false, error: 'offeringId dan message wajib diisi' }, 400);
		}
		const message = String(body.message).trim();
		if (!message) {
			return jsonResponse({ success: false, error: 'Pesan tidak boleh kosong' }, 400);
		}
		if (message.length > 1000) {
			return jsonResponse({ success: false, error: 'Pesan maksimal 1000 karakter' }, 400);
		}

		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO course_chat (id, course_offering_id, user_id, message, created_at) VALUES (?, ?, ?, ?, ?)`
		).bind(id, body.offeringId, userId, message, now).run();

		const inserted = await db.prepare(
			`SELECT cc.*, u.display_name, u.avatar_url
			 FROM course_chat cc
			 LEFT JOIN users u ON u.id = cc.user_id
			 WHERE cc.id = ?`
		).bind(id).first<any>();

		return jsonResponse({ success: true, data: inserted }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

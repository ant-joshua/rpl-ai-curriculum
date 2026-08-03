import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// POST /api/aiedu/chat/[threadId]/messages/[messageId]/save-to-bank
// Save an assistant chat reply as a bank document.
// Body: { title?, doc_type? } — doc_type defaults to 'modul_ajar', title auto if missing.
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const thread = await db.prepare(
			'SELECT * FROM aiedu_chat_threads WHERE id = ? AND user_id = ?'
		).bind(params.threadId, session.user.id).first<any>();
		if (!thread) return jsonResponse({ success: false, error: 'Thread not found' }, 404);

		const msg = await db.prepare(
			'SELECT * FROM aiedu_chat_messages WHERE id = ? AND thread_id = ?'
		).bind(params.messageId, thread.id).first<any>();
		if (!msg) return jsonResponse({ success: false, error: 'Message not found' }, 404);
		if (msg.role !== 'assistant') return jsonResponse({ success: false, error: 'Only assistant replies can be saved' }, 400);

		const body = await request.json();
		const { title, doc_type } = body;
		const docType = doc_type || 'modul_ajar';
		const subject = thread.subject || 'Umum';
		const titleFinal = title || `${subject} — ${thread.title.slice(0, 40)}`;

		const docId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_documents (id, doc_type, subject, title, content, source, tags, curriculum_id, owner_id, created_at)
			 VALUES (?, ?, ?, ?, ?, 'generated', ?, ?, ?, datetime('now'))`
		).bind(
			docId, docType, subject, titleFinal, msg.content,
			JSON.stringify(['chat']), thread.curriculum_id, session.user.id
		).run();

		return jsonResponse({ success: true, data: { id: docId } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

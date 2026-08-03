import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { chatGuru } from '$lib/server/aiedu';

// POST /api/aiedu/chat/[threadId]/messages — send message + get AI reply
// Body: { content: string }
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { content } = body;
		if (!content?.trim()) return jsonResponse({ success: false, error: 'Message required' }, 400);

		const thread = await db.prepare(
			`SELECT t.*, c.name AS curriculum_name, c.type AS curriculum_type, c.description AS curriculum_desc
			 FROM aiedu_chat_threads t
			 LEFT JOIN curricula c ON c.id = t.curriculum_id
			 WHERE t.id = ? AND t.user_id = ?`
		).bind(params.threadId, session.user.id).first<any>();
		if (!thread) return jsonResponse({ success: false, error: 'Thread not found' }, 404);

		// Save user message
		const userMsgId = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO aiedu_chat_messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
		).bind(userMsgId, thread.id, 'user', content.trim()).run();

		// Build history (last 20 messages)
		const { results: historyRows } = await db.prepare(
			'SELECT role, content FROM aiedu_chat_messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 20'
		).bind(thread.id).all<any>();
		const history: { role: 'user' | 'assistant'; content: string }[] = (historyRows || [])
			.reverse()
			.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

		const curriculumContext = thread.curriculum_name
			? `${thread.curriculum_name}${thread.curriculum_type ? ` (${thread.curriculum_type})` : ''}`
			: 'Kurikulum Merdeka';

		const systemPrompt = `Kamu adalah AI Chat Guru (AIEdu) — asisten pribadi untuk guru.
Konteks thread: Mapel ${thread.subject || '-'}, Kelas ${thread.grade || '-'}, Kurikulum ${curriculumContext}.
Bantu guru membuat perangkat ajar (ATP, modul ajar, LKPD, soal, rubrik, PPT), strategi mengajar, penilaian, pengelolaan kelas, dan pedagogi.
Jawab dalam Bahasa Indonesia, jelas, praktis, dengan contoh bila diminta. Gunakan markdown untuk poin/tabel.`;

		// Call AI
		let reply = '';
		try {
			reply = await chatGuru(platform, history, systemPrompt);
		} catch (aiErr) {
			const msg = aiErr instanceof Error ? aiErr.message : 'AI generation failed';
			return jsonResponse({ success: false, error: msg }, 502);
		}

		// Save assistant message
		const aiMsgId = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO aiedu_chat_messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
		).bind(aiMsgId, thread.id, 'assistant', reply).run();

		await db.prepare('UPDATE aiedu_chat_threads SET updated_at = datetime(\'now\') WHERE id = ?').bind(thread.id).run();

		// Update title from first user message if still default
		if (thread.title === 'Chat Baru') {
			const firstMsg = content.trim().slice(0, 60);
			await db.prepare('UPDATE aiedu_chat_threads SET title = ? WHERE id = ?').bind(firstMsg, thread.id).run();
		}

		return jsonResponse({ success: true, data: { user_message_id: userMsgId, assistant_message: { id: aiMsgId, content: reply } } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

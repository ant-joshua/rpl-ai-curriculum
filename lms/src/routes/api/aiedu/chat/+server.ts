import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { chatGuru } from '$lib/server/aiedu';

// GET /api/aiedu/chat — list threads
// POST /api/aiedu/chat — create thread { title?, subject?, grade?, curriculum_id? }
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT t.id, t.title, t.subject, t.grade, t.curriculum_id,
			        c.name AS curriculum_name,
			        (SELECT COUNT(*) FROM aiedu_chat_messages m WHERE m.thread_id = t.id) AS message_count,
			        t.updated_at
			 FROM aiedu_chat_threads t
			 LEFT JOIN curricula c ON c.id = t.curriculum_id
			 WHERE t.user_id = ?
			 ORDER BY t.updated_at DESC`
		).bind(session.user.id).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { title, subject, grade, curriculum_id, lesson_id } = body;

		const id = crypto.randomUUID();

		// If lesson_id provided, fetch lesson + content blocks for context
		let lessonContext = '';
		let lessonSubject = subject || '';
		let lessonGrade = grade || '';
		if (lesson_id) {
			const lesson = await db.prepare(
				`SELECT l.*, co.name AS offering_name, co.tenant_id
				 FROM lessons l
				 LEFT JOIN course_offerings co ON co.id = l.course_offering_id
				 WHERE l.id = ?`
			).bind(lesson_id).first<any>();
			if (lesson) {
				lessonSubject = lessonSubject || lesson.offering_name || '';
				lessonGrade = lessonGrade || '';
				const { results: blocks } = await db.prepare(
					`SELECT type, content FROM lesson_content_blocks WHERE lesson_id = ? ORDER BY order_index ASC LIMIT 30`
				).bind(lesson_id).all<any>();
				const blockText = (blocks || [])
					.map((b: any) => {
						let content = b.content || '';
						if (typeof content === 'string' && (content.startsWith('[') || content.startsWith('{'))) {
							try {
								const parsed = JSON.parse(content);
								content = typeof parsed === 'string' ? parsed : JSON.stringify(parsed).slice(0, 2000);
							} catch { /* keep raw */ }
						}
						return `[${b.type}] ${content}`.slice(0, 3000);
					})
					.join('\n\n');
				lessonContext = `Materi lesson "${lesson.title}":\n${blockText}`.slice(0, 8000);
			}
		}

		await db.prepare(
			`INSERT INTO aiedu_chat_threads (id, user_id, title, subject, grade, curriculum_id, lesson_id, lesson_context)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id, session.user.id, title?.trim() || 'Chat Baru',
			lessonSubject, lessonGrade, curriculum_id || null, lesson_id || null, lessonContext || null
		).run();

		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

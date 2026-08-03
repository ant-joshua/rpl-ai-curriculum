import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { generateDoc, DOC_TYPE_META, type DocType } from '$lib/server/aiedu';

// POST /api/aiedu/generate — generate a curriculum document
// Body: { doc_type, subject, grade, topic, extra_context? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { doc_type, subject, grade, topic, extra_context, curriculum_id } = body;

		if (!doc_type || !DOC_TYPE_META[doc_type as DocType]) {
			return jsonResponse({ success: false, error: 'doc_type invalid' }, 400);
		}
		if (!subject?.trim() || !grade?.trim()) {
			return jsonResponse({ success: false, error: 'subject and grade required' }, 400);
		}

		// Curriculum context (if selected)
		let curriculumContext = '';
		if (curriculum_id) {
			const cur = await db.prepare('SELECT name, type, description FROM curricula WHERE id = ? AND is_active = 1').bind(curriculum_id).first<any>();
			if (cur) {
				curriculumContext = `${cur.name} (${cur.type})${cur.description ? ` — ${cur.description}` : ''}`;
			}
		}

		// Generate
		let output = '';
		try {
			output = await generateDoc(platform, doc_type as DocType, subject.trim(), grade.trim(), topic?.trim() || '', extra_context, curriculumContext);
		} catch (aiErr) {
			const msg = aiErr instanceof Error ? aiErr.message : 'AI generation failed';
			return jsonResponse({ success: false, error: msg }, 502);
		}

		if (!output) return jsonResponse({ success: false, error: 'Empty response from AI' }, 502);

		// Save generation history
		const genId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_generations (id, user_id, doc_type, subject, input, output, status, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, 'done', datetime('now'))`
		).bind(
			genId, session.user.id, doc_type, subject.trim(),
			JSON.stringify({ grade, topic, extra_context, curriculum_id }),
			output
		).run();

		return jsonResponse({
			success: true,
			data: { id: genId, output },
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

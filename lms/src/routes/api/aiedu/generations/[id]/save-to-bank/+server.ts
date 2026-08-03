import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';

// POST /api/aiedu/generations/[id]/save-to-bank — save generated doc into bank
// Body: { title?, subject?, doc_type?, curriculum_id? } (defaults from generation)
export async function POST({ request, platform, params }: { request: Request; platform: App.Platform; params: Record<string, string> }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const gen = await db.prepare(
			'SELECT * FROM aiedu_generations WHERE id = ? AND user_id = ?'
		).bind(params.id, session.user.id).first<any>();
		if (!gen) return jsonResponse({ success: false, error: 'Generation not found' }, 404);

		const body = await request.json();
		const { title, subject, doc_type, curriculum_id } = body;

		// Parse input for defaults
		let inputData: any = {};
		try { inputData = JSON.parse(gen.input || '{}'); } catch { /* ignore */ }

		const docType = doc_type || gen.doc_type;
		const subjectFinal = subject || gen.subject || 'Umum';
		const titleFinal = title || `${subjectFinal} — ${docType.replace(/_/g, ' ')}`;
		const curriculumFinal = curriculum_id || inputData.curriculum_id || null;

		const docId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_documents (id, doc_type, subject, title, content, source, tags, curriculum_id, owner_id, created_at)
			 VALUES (?, ?, ?, ?, ?, 'generated', ?, ?, ?, datetime('now'))`
		).bind(
			docId, docType, subjectFinal, titleFinal, gen.output,
			JSON.stringify(['generated']), curriculumFinal, session.user.id
		).run();

		return jsonResponse({ success: true, data: { id: docId } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

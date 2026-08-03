import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { generateRapor } from '$lib/server/aiedu';

// POST /api/aiedu/rapor — generate report card
// Body: { student_name, grade, subject, curriculum_id?, scores: [{name, score}], attitude? }
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { student_name, grade, subject, curriculum_id, scores, attitude } = body;

		if (!student_name?.trim()) return jsonResponse({ success: false, error: 'student_name required' }, 400);
		if (!Array.isArray(scores) || scores.length === 0) return jsonResponse({ success: false, error: 'scores required' }, 400);

		// Curriculum context
		let curriculumContext = 'Kurikulum Merdeka';
		if (curriculum_id) {
			const cur = await db.prepare('SELECT name, type, description FROM curricula WHERE id = ? AND is_active = 1').bind(curriculum_id).first<any>();
			if (cur) curriculumContext = `${cur.name} (${cur.type})${cur.description ? ` — ${cur.description}` : ''}`;
		}

		// Call AI
		let output = '';
		try {
			output = await generateRapor(
				platform,
				student_name.trim(), grade || '', subject?.trim() || 'Umum',
				curriculumContext, scores, attitude
			);
		} catch (aiErr) {
			const msg = aiErr instanceof Error ? aiErr.message : 'AI generation failed';
			return jsonResponse({ success: false, error: msg }, 502);
		}

		// Save history
		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_rapors (id, user_id, student_name, subject, grade, curriculum_id, input, output, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id, session.user.id, student_name.trim(), subject?.trim() || '', grade || '', curriculum_id || null,
			JSON.stringify({ scores, attitude }), output
		).run();

		return jsonResponse({ success: true, data: { id, output } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

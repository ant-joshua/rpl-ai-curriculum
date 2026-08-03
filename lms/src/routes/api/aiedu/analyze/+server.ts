import { jsonResponse, getDB } from '$lib/server/d1';
import { getSession, getTokenFromRequest } from '$lib/server/auth';
import { analyzeGrades } from '$lib/server/aiedu';

// POST /api/aiedu/analyze — analyze grade data with AI
// Body: { subject, grade, curriculum_id?, students: string[], assignments: string[], scores: (number|null)[][] }
//   scores[assignmentIdx][studentIdx]
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session invalid' }, 401);

		const db = getDB(platform);
		const body = await request.json();
		const { subject, grade, curriculum_id, students, assignments, scores } = body;

		if (!subject?.trim() || !grade?.trim()) return jsonResponse({ success: false, error: 'subject and grade required' }, 400);
		if (!Array.isArray(students) || students.length === 0) return jsonResponse({ success: false, error: 'students required' }, 400);
		if (!Array.isArray(scores)) return jsonResponse({ success: false, error: 'scores required' }, 400);

		// Curriculum context
		let curriculumContext = 'Kurikulum Merdeka';
		if (curriculum_id) {
			const cur = await db.prepare('SELECT name, type, description FROM curricula WHERE id = ? AND is_active = 1').bind(curriculum_id).first<any>();
			if (cur) curriculumContext = `${cur.name} (${cur.type})${cur.description ? ` — ${cur.description}` : ''}`;
		}

		// Call AI
		let output = '';
		try {
			output = await analyzeGrades(platform, subject.trim(), grade.trim(), curriculumContext, { students, scores });
		} catch (aiErr) {
			const msg = aiErr instanceof Error ? aiErr.message : 'AI generation failed';
			return jsonResponse({ success: false, error: msg }, 502);
		}

		// Save history
		const id = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO aiedu_analyses (id, user_id, subject, grade, curriculum_id, input, output, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id, session.user.id, subject.trim(), grade.trim(), curriculum_id || null,
			JSON.stringify({ students, assignments, scores }), output
		).run();

		return jsonResponse({ success: true, data: { id, output } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

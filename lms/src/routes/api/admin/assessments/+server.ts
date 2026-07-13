import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const course_offering_id = url.searchParams.get('course_offering_id');
		let query = 'SELECT * FROM assessments';
		const params: unknown[] = [];

		if (course_offering_id) {
			query += ' WHERE course_offering_id = ?';
			params.push(course_offering_id);
		}

		query += ' ORDER BY created_at DESC';

		const stmt = db.prepare(query);
		const bound = params.length ? stmt.bind(...params) : stmt;
		const { results } = await bound.all<any>();
		return jsonResponse({ success: true, data: results });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const id = crypto.randomUUID();

		await db.prepare(
			`INSERT INTO assessments (id, course_offering_id, content_block_id, title, type, passing_score, time_limit_minutes,
			 shuffle_questions, show_results, max_attempts, weight, questions, due_date, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			body.course_offering_id,
			body.content_block_id ?? null,
			body.title ?? '',
			body.type ?? 'quiz',
			body.passing_score ?? 70,
			body.time_limit_minutes ?? null,
			body.shuffle_questions ?? 1,
			body.show_results ?? 1,
			body.max_attempts ?? 1,
			body.weight ?? 0,
			body.questions ? JSON.stringify(body.questions) : '[]',
			body.due_date ?? null,
			body.status ?? 'draft'
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

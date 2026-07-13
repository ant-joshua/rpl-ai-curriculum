import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		let query = 'SELECT * FROM question_bank WHERE 1=1';
		const params: unknown[] = [];

		const type = url.searchParams.get('type');
		const difficulty = url.searchParams.get('difficulty');
		const course_offering_id = url.searchParams.get('course_offering_id');
		const status = url.searchParams.get('status');

		if (type) { query += ' AND type = ?'; params.push(type); }
		if (difficulty) { query += ' AND difficulty = ?'; params.push(difficulty); }
		if (course_offering_id) { query += ' AND course_offering_id = ?'; params.push(course_offering_id); }
		if (status) { query += ' AND status = ?'; params.push(status); }

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
			`INSERT INTO question_bank (id, course_offering_id, type, question, options, code_template, test_cases, difficulty, tags, explanation, points, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			body.course_offering_id ?? null,
			body.type ?? 'multiple_choice',
			body.question ?? '',
			body.options ? JSON.stringify(body.options) : null,
			body.code_template ?? null,
			body.test_cases ? JSON.stringify(body.test_cases) : null,
			body.difficulty ?? 'medium',
			body.tags ?? null,
			body.explanation ?? null,
			body.points ?? 1,
			body.status ?? 'draft'
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const course_offering_id = url.searchParams.get('course_offering_id');
		let query = 'SELECT * FROM assignments';
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
			`INSERT INTO assignments (id, course_offering_id, content_block_id, title, description, submission_type,
			 max_score, weight, due_date, allow_late_submission, late_penalty_percent, rubric, status, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			body.course_offering_id,
			body.content_block_id ?? null,
			body.title ?? '',
			body.description ?? null,
			body.submission_type ?? 'text',
			body.max_score ?? 100,
			body.weight ?? 0,
			body.due_date ?? null,
			body.allow_late_submission ?? 0,
			body.late_penalty_percent ?? 10,
			body.rubric ? JSON.stringify(body.rubric) : '[]',
			body.status ?? 'draft'
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

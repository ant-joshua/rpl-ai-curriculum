import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const courseId = url.searchParams.get('course_id');
		let query = 'SELECT * FROM course_offerings';
		const params: any[] = [];
		if (courseId) {
			query += ' WHERE course_id = ?';
			params.push(courseId);
		}
		query += ' ORDER BY created_at DESC';
		const rows = await db.prepare(query).bind(...params).all();
		return jsonResponse({ success: true, data: rows.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const body = await request.json();
		const { course_id, name, code } = body;
		if (!course_id || !name || !code) {
			return jsonResponse({ success: false, error: 'course_id, name, and code required' }, 400);
		}
		const db = getDB(platform);
		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			'INSERT INTO course_offerings (id, course_id, name, code, instructor_id, start_date, end_date, enrollment_start, enrollment_end, max_students, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
		).bind(
			id, course_id, name, code,
			body.instructor_id || null,
			body.start_date || null,
			body.end_date || null,
			body.enrollment_start || null,
			body.enrollment_end || null,
			body.max_students ?? null,
			body.status || 'draft',
			now, now
		).run();
		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

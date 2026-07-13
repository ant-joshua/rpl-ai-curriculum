import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		let query = 'SELECT * FROM calendar_events WHERE 1=1';
		const params: unknown[] = [];

		const course_offering_id = url.searchParams.get('course_offering_id');
		const from_date = url.searchParams.get('from_date');
		const to_date = url.searchParams.get('to_date');

		if (course_offering_id) { query += ' AND course_offering_id = ?'; params.push(course_offering_id); }
		if (from_date) { query += ' AND event_date >= ?'; params.push(from_date); }
		if (to_date) { query += ' AND event_date <= ?'; params.push(to_date); }

		query += ' ORDER BY event_date ASC';

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
			`INSERT INTO calendar_events (id, course_offering_id, title, description, event_date, event_type, all_day, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id,
			body.course_offering_id ?? null,
			body.title ?? '',
			body.description ?? null,
			body.event_date ?? null,
			body.event_type ?? 'other',
			body.all_day ?? 0
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/admin/live-classes?offering_id=X — list live classes */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offering_id');
		let { results } = await db.prepare(`
			SELECT lc.*, u.display_name AS instructor_name,
			       co.name AS offering_name
			FROM live_classes lc
			LEFT JOIN users u ON u.id = lc.instructor_id
			LEFT JOIN course_offerings co ON co.id = lc.course_offering_id
			${offeringId ? 'WHERE lc.course_offering_id = ?' : ''}
			ORDER BY lc.start_at DESC
			LIMIT 100
		`).bind(...(offeringId ? [offeringId] : [])).all<any>();
		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/admin/live-classes — create live class */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { course_offering_id, title, description, instructor_id, start_at, duration_minutes, join_url, recording_url } = body;

		if (!course_offering_id || !title || !start_at) {
			return jsonResponse({ success: false, error: 'course_offering_id, title, start_at wajib' }, 400);
		}

		await db.prepare(`
			INSERT INTO live_classes (id, course_offering_id, title, description, instructor_id, start_at, duration_minutes, join_url, recording_url)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`).bind(
			crypto.randomUUID(), course_offering_id, title, description || null,
			instructor_id || null, start_at, duration_minutes || 60, join_url || null, recording_url || null
		).run();

		return jsonResponse({ success: true }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

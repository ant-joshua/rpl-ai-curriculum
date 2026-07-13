import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const offeringId = url.searchParams.get('course_offering_id');
		let query = 'SELECT * FROM enrollments';
		const params: any[] = [];
		if (offeringId) {
			query += ' WHERE course_offering_id = ?';
			params.push(offeringId);
		}
		query += ' ORDER BY enrolled_at DESC';
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
		const { user_id, course_offering_id } = body;
		if (!user_id || !course_offering_id) {
			return jsonResponse({ success: false, error: 'user_id and course_offering_id required' }, 400);
		}
		const db = getDB(platform);

		// Check UNIQUE(user_id, course_offering_id) constraint upfront
		const existing = await db.prepare(
			'SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(user_id, course_offering_id).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Enrollment already exists for this user and offering' }, 409);
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();
		await db.prepare(
			'INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(
			id, user_id, course_offering_id,
			body.role || 'student',
			body.status || 'active',
			now
		).run();
		return jsonResponse({ success: true, data: { id } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

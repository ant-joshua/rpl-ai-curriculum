import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const dependentId = url.searchParams.get('dependent_id');
		const prerequisiteId = url.searchParams.get('prerequisite_id');

		let query = 'SELECT * FROM prerequisites';
		const params: string[] = [];
		const conditions: string[] = [];

		if (dependentId) {
			conditions.push('dependent_id = ?');
			params.push(dependentId);
		}
		if (prerequisiteId) {
			conditions.push('prerequisite_id = ?');
			params.push(prerequisiteId);
		}
		if (conditions.length > 0) {
			query += ' WHERE ' + conditions.join(' AND ');
		}

		const result = params.length > 0
			? await db.prepare(query).bind(...params).all()
			: await db.prepare(query).all();

		return jsonResponse({ success: true, data: result.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { course_offering_id, prerequisite_id, dependent_id } = body;

		if (!course_offering_id || !prerequisite_id || !dependent_id) {
			return jsonResponse({ success: false, error: 'course_offering_id, prerequisite_id, and dependent_id are required' }, 400);
		}

		if (prerequisite_id === dependent_id) {
			return jsonResponse({ success: false, error: 'prerequisite_id cannot equal dependent_id' }, 400);
		}

		const id = crypto.randomUUID();

		await db.prepare(
			`INSERT INTO prerequisites (id, course_offering_id, prerequisite_id, dependent_id)
			 VALUES (?, ?, ?, ?)`
		).bind(id, course_offering_id, prerequisite_id, dependent_id).run();

		const row = await db.prepare('SELECT * FROM prerequisites WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		// Handle UNIQUE constraint violation
		if (msg.includes('UNIQUE constraint')) {
			return jsonResponse({ success: false, error: 'This prerequisite relationship already exists' }, 409);
		}
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

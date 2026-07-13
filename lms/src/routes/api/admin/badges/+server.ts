import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const result = await db.prepare('SELECT * FROM badges ORDER BY created_at DESC').all();
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
		const { id, name, description, icon, criteria_type, criteria_value } = body;

		if (!id || !name || !description || !icon || !criteria_type) {
			return jsonResponse({ success: false, error: 'id, name, description, icon, and criteria_type are required' }, 400);
		}

		const validTypes = ['lessons_completed', 'assessments_passed', 'streak_days', 'courses_completed', 'discussion_posts', 'custom'];
		if (!validTypes.includes(criteria_type)) {
			return jsonResponse({ success: false, error: 'Invalid criteria_type' }, 400);
		}

		await db.prepare(
			`INSERT INTO badges (id, name, description, icon, criteria_type, criteria_value)
			 VALUES (?, ?, ?, ?, ?, ?)`
		).bind(id, name, description, icon, criteria_type, criteria_value ?? 1).run();

		const row = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		if (msg.includes('UNIQUE constraint')) {
			return jsonResponse({ success: false, error: 'Badge with this ID already exists' }, 409);
		}
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

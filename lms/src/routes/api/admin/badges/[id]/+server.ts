import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		const validTypes = ['lessons_completed', 'assessments_passed', 'streak_days', 'courses_completed', 'discussion_posts', 'custom'];
		if (merged.criteria_type && !validTypes.includes(merged.criteria_type)) {
			return jsonResponse({ success: false, error: 'Invalid criteria_type' }, 400);
		}

		await db.prepare(
			`UPDATE badges SET name = ?, description = ?, icon = ?, criteria_type = ?, criteria_value = ?
			 WHERE id = ?`
		).bind(
			merged.name,
			merged.description,
			merged.icon,
			merged.criteria_type,
			merged.criteria_value,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		await db.prepare('DELETE FROM user_badges WHERE badge_id = ?').bind(params.id).run();
		await db.prepare('DELETE FROM badges WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM xp_rules WHERE id = ?').bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM xp_rules WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		const validTypes = ['lesson_complete', 'daily_login', 'assignment_graded', 'assessment_completed', 'discussion_post', 'streak_milestone', 'custom'];
		if (merged.action_type && !validTypes.includes(merged.action_type)) {
			return jsonResponse({ success: false, error: 'Invalid action_type' }, 400);
		}

		await db.prepare(
			`UPDATE xp_rules SET action_type = ?, xp_amount = ?, description = ?, is_active = ?, updated_at = datetime('now')
			 WHERE id = ?`
		).bind(
			merged.action_type,
			merged.xp_amount,
			merged.description || '',
			merged.is_active ? 1 : 0,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM xp_rules WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM xp_rules WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);
		await db.prepare('DELETE FROM xp_rules WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

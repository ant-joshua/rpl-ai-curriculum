import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);

		const countResult = await db.prepare('SELECT COUNT(*) as total FROM badges').first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare('SELECT * FROM badges ORDER BY unlocked_at DESC').all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const result = await db.prepare('SELECT * FROM badges ORDER BY unlocked_at DESC LIMIT ? OFFSET ?').bind(pag.limit, pag.offset).all();
		return jsonResponse({ success: true, data: result.results || [], pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { id, name, description, icon, criteria_type, criteria_value, xp_reward } = body;

		if (!id || !name || !description || !icon || !criteria_type) {
			return jsonResponse({ success: false, error: 'id, name, description, icon, and criteria_type are required' }, 400);
		}

		const validTypes = ['lessons_completed', 'assessments_passed', 'streak_days', 'courses_completed', 'discussion_posts', 'custom'];
		if (!validTypes.includes(criteria_type)) {
			return jsonResponse({ success: false, error: 'Invalid criteria_type' }, 400);
		}

		await db.prepare(
			`INSERT INTO badges (id, name, description, icon, criteria_type, criteria_value, xp_reward)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		).bind(id, name, description, icon, criteria_type, criteria_value ?? 1, xp_reward ?? 0).run();

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

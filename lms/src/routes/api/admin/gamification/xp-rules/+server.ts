import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);

		const countResult = await db.prepare('SELECT COUNT(*) as total FROM xp_rules').first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare('SELECT * FROM xp_rules ORDER BY action_type ASC').all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const result = await db.prepare('SELECT * FROM xp_rules ORDER BY action_type ASC LIMIT ? OFFSET ?').bind(pag.limit, pag.offset).all();
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
		const { action_type, xp_amount, description, is_active } = body;

		if (!action_type || xp_amount === undefined) {
			return jsonResponse({ success: false, error: 'action_type and xp_amount are required' }, 400);
		}

		const validTypes = ['lesson_complete', 'daily_login', 'assignment_graded', 'assessment_completed', 'discussion_post', 'streak_milestone', 'custom'];
		if (!validTypes.includes(action_type)) {
			return jsonResponse({ success: false, error: 'Invalid action_type' }, 400);
		}

		const id = `xp_rule_${crypto.randomUUID().slice(0, 8)}`;
		await db.prepare(
			`INSERT INTO xp_rules (id, action_type, xp_amount, description, is_active)
			 VALUES (?, ?, ?, ?, ?)`
		).bind(id, action_type, xp_amount, description || '', is_active !== undefined ? (is_active ? 1 : 0) : 1).run();

		const row = await db.prepare('SELECT * FROM xp_rules WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		if (msg.includes('UNIQUE constraint')) {
			return jsonResponse({ success: false, error: 'Rule for this action type already exists' }, 409);
		}
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM question_bank WHERE id = ?').bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM question_bank WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		await db.prepare(
			`UPDATE question_bank SET course_offering_id = ?, type = ?, question = ?, options = ?, code_template = ?,
			 test_cases = ?, difficulty = ?, tags = ?, explanation = ?, points = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
		).bind(
			merged.course_offering_id ?? null,
			merged.type,
			merged.question,
			merged.options ? (typeof merged.options === 'string' ? merged.options : JSON.stringify(merged.options)) : null,
			merged.code_template ?? null,
			merged.test_cases ? (typeof merged.test_cases === 'string' ? merged.test_cases : JSON.stringify(merged.test_cases)) : null,
			merged.difficulty,
			merged.tags ?? null,
			merged.explanation ?? null,
			merged.points,
			merged.status,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM question_bank WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM question_bank WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);
		await db.prepare('DELETE FROM question_bank WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

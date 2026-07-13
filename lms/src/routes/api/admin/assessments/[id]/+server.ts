import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		await db.prepare(
			`UPDATE assessments SET course_offering_id = ?, content_block_id = ?, title = ?, type = ?, passing_score = ?,
			 time_limit_minutes = ?, shuffle_questions = ?, show_results = ?, max_attempts = ?, weight = ?,
			 questions = ?, due_date = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
		).bind(
			merged.course_offering_id,
			merged.content_block_id ?? null,
			merged.title,
			merged.type,
			merged.passing_score,
			merged.time_limit_minutes ?? null,
			merged.shuffle_questions,
			merged.show_results,
			merged.max_attempts,
			merged.weight,
			merged.questions ? (typeof merged.questions === 'string' ? merged.questions : JSON.stringify(merged.questions)) : '[]',
			merged.due_date ?? null,
			merged.status,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM assessments WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM assessments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);
		await db.prepare('DELETE FROM assessments WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare(
			'SELECT asub.*, u.display_name AS user_name FROM assignment_submissions asub LEFT JOIN users u ON u.id = asub.user_id WHERE asub.id = ?'
		).bind(params.id).first<any>();
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
		const existing = await db.prepare('SELECT * FROM assignment_submissions WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();

		await db.prepare(
			`UPDATE assignment_submissions SET status = ?, submission_text = ?, file_urls = ?, score = ?, max_score = ?, graded_by = ?, graded_at = ?, feedback = ?, submitted_at = ?, updated_at = datetime('now') WHERE id = ?`
		).bind(
			body.status ?? existing.status,
			body.submission_text ?? existing.submission_text,
			body.file_urls ? JSON.stringify(body.file_urls) : existing.file_urls,
			body.score ?? existing.score,
			body.max_score ?? existing.max_score,
			body.graded_by ?? existing.graded_by,
			body.graded_at ?? existing.graded_at,
			body.feedback ?? existing.feedback,
			body.submitted_at ?? existing.submitted_at,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM assignment_submissions WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare(
			`SELECT a.*, co.name AS offering_name, co.code AS offering_code,
			        u.display_name AS creator_name
			 FROM assignments a
			 LEFT JOIN course_offerings co ON co.id = a.course_offering_id
			 LEFT JOIN users u ON u.id = a.created_by
			 WHERE a.id = ?`
		).bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Tugas tidak ditemukan' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM assignments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Tugas tidak ditemukan' }, 404);

		const body = await request.json();
		const now = new Date().toISOString();

		await db.prepare(
			`UPDATE assignments SET
				title = ?, description = ?, lesson_id = ?, due_date = ?, max_score = ?,
				submission_type = ?, weight = ?, allow_late_submission = ?,
				late_penalty_percent = ?, status = ?, rubric = ?, updated_at = ?
			 WHERE id = ?`
		).bind(
			body.title ?? existing.title,
			body.description ?? existing.description,
			body.lesson_id ?? existing.lesson_id,
			body.due_date ?? existing.due_date,
			body.max_score ?? existing.max_score,
			body.submission_type ?? existing.submission_type,
			body.weight ?? existing.weight,
			body.allow_late_submission ?? existing.allow_late_submission,
			body.late_penalty_percent ?? existing.late_penalty_percent,
			body.status ?? existing.status,
			body.rubric ? JSON.stringify(body.rubric) : existing.rubric,
			now,
			params.id
		).run();

		const updated = await db.prepare('SELECT * FROM assignments WHERE id = ?').bind(params.id).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT id FROM assignments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Tugas tidak ditemukan' }, 404);

		// Delete related submissions
		await db.prepare('DELETE FROM assignment_submissions WHERE assignment_id = ?').bind(params.id).run();
		await db.prepare('DELETE FROM assignments WHERE id = ?').bind(params.id).run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

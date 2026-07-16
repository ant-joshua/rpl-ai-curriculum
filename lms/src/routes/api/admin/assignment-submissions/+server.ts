import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const assignment_id = url.searchParams.get('assignment_id');
		const course_offering_id = url.searchParams.get('course_offering_id');
		const user_id = url.searchParams.get('user_id');

		const params: unknown[] = [];
		const wheres: string[] = [];

		if (assignment_id && assignment_id !== 'all') { wheres.push('asub.assignment_id = ?'); params.push(assignment_id); }
		if (course_offering_id) { wheres.push('asub.assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?)'); params.push(course_offering_id); }
		if (user_id) { wheres.push('asub.user_id = ?'); params.push(user_id); }

		const where = wheres.length ? ' WHERE ' + wheres.join(' AND ') : '';

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM assignment_submissions asub${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const { results } = await db.prepare(`SELECT asub.*, u.display_name AS user_name FROM assignment_submissions asub LEFT JOIN users u ON u.id = asub.user_id${where} ORDER BY asub.created_at DESC`).bind(...params).all<any>();
			return jsonResponse({ success: true, data: results, total });
		}

		const sql = `SELECT asub.*, u.display_name AS user_name FROM assignment_submissions asub LEFT JOIN users u ON u.id = asub.user_id${where} ORDER BY asub.created_at DESC LIMIT ? OFFSET ?`;
		const { results } = await db.prepare(sql).bind(...params, pag.limit, pag.offset).all<any>();
		return jsonResponse({ success: true, data: results, pagination: { page: pag.page, limit: pag.limit, total, totalPages: Math.ceil(total / pag.limit) } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const id = crypto.randomUUID();

		await db.prepare(
			`INSERT INTO assignment_submissions (id, assignment_id, user_id, status, submission_text, file_urls, score, max_score, graded_by, graded_at, feedback, submitted_at, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			body.assignment_id,
			body.user_id,
			body.status ?? 'submitted',
			body.submission_text ?? null,
			body.file_urls ? JSON.stringify(body.file_urls) : null,
			body.score ?? null,
			body.max_score ?? null,
			body.graded_by ?? null,
			body.graded_at ?? null,
			body.feedback ?? null,
			body.status === 'submitted' ? new Date().toISOString() : null
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const assessment_id = url.searchParams.get('assessment_id');
		const user_id = url.searchParams.get('user_id');

		const params: unknown[] = [];
		const wheres: string[] = [];

		if (assessment_id) { wheres.push('asub.assessment_id = ?'); params.push(assessment_id); }
		if (user_id) { wheres.push('asub.user_id = ?'); params.push(user_id); }

		const where = wheres.length ? ' WHERE ' + wheres.join(' AND ') : '';

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM assessment_submissions asub${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const { results } = await db.prepare(`SELECT asub.*, u.display_name AS user_name FROM assessment_submissions asub LEFT JOIN users u ON u.id = asub.user_id${where} ORDER BY asub.created_at DESC`).bind(...params).all<any>();
			return jsonResponse({ success: true, data: results, total });
		}

		const sql = `SELECT asub.*, u.display_name AS user_name FROM assessment_submissions asub LEFT JOIN users u ON u.id = asub.user_id${where} ORDER BY asub.created_at DESC LIMIT ? OFFSET ?`;
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
			`INSERT INTO assessment_submissions (id, assessment_id, user_id, status, answers, score, max_score, graded_by, graded_at, feedback, submitted_at, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		).bind(
			id,
			body.assessment_id,
			body.user_id,
			body.status ?? 'submitted',
			body.answers ? JSON.stringify(body.answers) : null,
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

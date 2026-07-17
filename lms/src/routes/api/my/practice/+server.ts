import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ url, request, platform }: { url: URL; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const course_offering_id = url.searchParams.get('course_offering_id');
		const search = url.searchParams.get('search');

		let where = "WHERE status = 'published'";
		const params: unknown[] = [];

		if (course_offering_id) {
			where += ' AND course_offering_id = ?';
			params.push(course_offering_id);
		}
		if (search) {
			where += ' AND (question LIKE ? OR tags LIKE ?)';
			params.push(`%${search}%`, `%${search}%`);
		}

		const { results } = await db.prepare(
			`SELECT id, course_offering_id, type, question, options, code_template, difficulty, points, tags
			 FROM question_bank ${where} ORDER BY created_at DESC`
		).bind(...params).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

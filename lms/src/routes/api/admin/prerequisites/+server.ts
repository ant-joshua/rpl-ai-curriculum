import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);
		const dependentId = url.searchParams.get('dependent_id');
		const prerequisiteId = url.searchParams.get('prerequisite_id');

		const params: unknown[] = [];
		const conditions: string[] = [];

		if (dependentId) { conditions.push('dependent_id = ?'); params.push(dependentId); }
		if (prerequisiteId) { conditions.push('prerequisite_id = ?'); params.push(prerequisiteId); }

		const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

		const countResult = await db.prepare(`SELECT COUNT(*) as total FROM prerequisites${where}`).bind(...params).first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const result = await db.prepare(`SELECT * FROM prerequisites${where}`).bind(...params).all();
			return jsonResponse({ success: true, data: result.results || [], total });
		}

		const result = await db.prepare(`SELECT * FROM prerequisites${where} LIMIT ? OFFSET ?`).bind(...params, pag.limit, pag.offset).all();
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
		const { course_offering_id, prerequisite_id, dependent_id } = body;

		if (!course_offering_id || !prerequisite_id || !dependent_id) {
			return jsonResponse({ success: false, error: 'course_offering_id, prerequisite_id, and dependent_id are required' }, 400);
		}

		if (prerequisite_id === dependent_id) {
			return jsonResponse({ success: false, error: 'prerequisite_id cannot equal dependent_id' }, 400);
		}

		const id = crypto.randomUUID();

		await db.prepare(
			`INSERT INTO prerequisites (id, course_offering_id, prerequisite_id, dependent_id)
			 VALUES (?, ?, ?, ?)`
		).bind(id, course_offering_id, prerequisite_id, dependent_id).run();

		const row = await db.prepare('SELECT * FROM prerequisites WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		// Handle UNIQUE constraint violation
		if (msg.includes('UNIQUE constraint')) {
			return jsonResponse({ success: false, error: 'This prerequisite relationship already exists' }, 409);
		}
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

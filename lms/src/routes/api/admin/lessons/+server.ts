import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const courseOfferingId = url.searchParams.get('course_offering_id');

		let query = 'SELECT * FROM lessons';
		const params: string[] = [];
		if (courseOfferingId) {
			query += ' WHERE course_offering_id = ?';
			params.push(courseOfferingId);
		}
		query += ' ORDER BY order_index ASC';

		const result = params.length > 0
			? await db.prepare(query).bind(...params).all()
			: await db.prepare(query).all();

		return jsonResponse({ success: true, data: result.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { course_offering_id, content_block_id, title, slug, duration_minutes, is_optional, status, unlock_days } = body;

		if (!course_offering_id || !title || !slug) {
			return jsonResponse({ success: false, error: 'course_offering_id, title, and slug are required' }, 400);
		}

		// Auto-set order_index = max + 1 if not provided
		let order_index = body.order_index;
		if (order_index === undefined || order_index === null) {
			const maxRow = await db.prepare(
				'SELECT MAX(order_index) as max_idx FROM lessons WHERE course_offering_id = ?'
			).bind(course_offering_id).first<any>();
			order_index = (maxRow?.max_idx ?? -1) + 1;
		}

		const id = crypto.randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			`INSERT INTO lessons (id, course_offering_id, content_block_id, title, slug, order_index, duration_minutes, is_optional, status, unlock_days, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		).bind(
			id,
			course_offering_id,
			content_block_id || null,
			title,
			slug,
			order_index,
			duration_minutes ?? null,
			is_optional ?? 0,
			status || 'draft',
			unlock_days ?? null,
			now,
			now
		).run();

		const row = await db.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

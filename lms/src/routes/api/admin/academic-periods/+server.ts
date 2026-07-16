import { getDB, jsonResponse } from '$lib/server/d1';
import { getPaginationParams } from '$lib/server/pagination';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const pag = getPaginationParams(url);

		const countResult = await db.prepare('SELECT COUNT(*) as total FROM academic_periods').first<{ total: number }>();
		const total = countResult?.total || 0;

		if (pag.page === 0 || pag.limit === 0) {
			const { results } = await db.prepare('SELECT * FROM academic_periods ORDER BY start_date DESC').all<any>();
			return jsonResponse({ success: true, data: results, total });
		}

		const { results } = await db.prepare('SELECT * FROM academic_periods ORDER BY start_date DESC LIMIT ? OFFSET ?').bind(pag.limit, pag.offset).all<any>();
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

		// If this period is set active, deactivate all others first
		if (body.is_active === 1 || body.is_active === true) {
			await db.prepare('UPDATE academic_periods SET is_active = 0').run();
		}

		await db.prepare(
			`INSERT INTO academic_periods (id, name, type, start_date, end_date, is_active, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
		).bind(
			id,
			body.name ?? '',
			body.type ?? 'semester',
			body.start_date ?? null,
			body.end_date ?? null,
			body.is_active ? 1 : 0
		).run();

		return jsonResponse({ success: true, data: { id, ...body } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

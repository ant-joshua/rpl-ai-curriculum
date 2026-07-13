import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const { results } = await db.prepare('SELECT * FROM academic_periods ORDER BY start_date DESC').all<any>();
		return jsonResponse({ success: true, data: results });
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

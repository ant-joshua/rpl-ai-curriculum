import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform }: { url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const key = url.searchParams.get('key');
		if (key) {
			const row = await db.prepare('SELECT * FROM gamification_settings WHERE key = ?').bind(key).first<any>();
			if (!row) return jsonResponse({ success: false, error: 'Setting not found' }, 404);
			return jsonResponse({ success: true, data: row });
		}
		const result = await db.prepare('SELECT * FROM gamification_settings ORDER BY key ASC').all();
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
		const { key, value } = body;

		if (!key || !value) {
			return jsonResponse({ success: false, error: 'key and value are required' }, 400);
		}

		const id = `gs_${crypto.randomUUID().slice(0, 8)}`;
		const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
		await db.prepare(
			`INSERT INTO gamification_settings (id, key, value, updated_at)
			 VALUES (?, ?, ?, datetime('now'))`
		).bind(id, key, valueStr).run();

		const row = await db.prepare('SELECT * FROM gamification_settings WHERE id = ?').bind(id).first<any>();
		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		if (msg.includes('UNIQUE constraint')) {
			return jsonResponse({ success: false, error: 'Setting with this key already exists' }, 409);
		}
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, url, platform }: { request: Request; url: URL; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const key = url.searchParams.get('key');
		if (!key) {
			return jsonResponse({ success: false, error: 'key query parameter required' }, 400);
		}

		const existing = await db.prepare('SELECT * FROM gamification_settings WHERE key = ?').bind(key).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Setting not found' }, 404);

		const body = await request.json();
		const valueStr = typeof body.value === 'string' ? body.value : JSON.stringify(body.value);

		await db.prepare(
			`UPDATE gamification_settings SET value = ?, updated_at = datetime('now') WHERE key = ?`
		).bind(valueStr, key).run();

		const updated = await db.prepare('SELECT * FROM gamification_settings WHERE key = ?').bind(key).first<any>();
		return jsonResponse({ success: true, data: updated });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

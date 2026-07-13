import { getDB, jsonResponse } from '$lib/server/d1';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { order } = body;

		if (!Array.isArray(order) || order.length === 0) {
			return jsonResponse({ success: false, error: 'order array is required' }, 400);
		}

		const statements: ReturnType<typeof db.prepare>[] = [];
		for (const item of order) {
			if (typeof item.id !== 'string' || typeof item.order_index !== 'number') {
				return jsonResponse({ success: false, error: 'Each order item must have id (string) and order_index (number)' }, 400);
			}
			const stmt = db.prepare(
				`UPDATE lessons SET order_index = ?, updated_at = datetime('now') WHERE id = ?`
			).bind(item.order_index, item.id);
			statements.push(stmt);
		}

		await db.batch(statements);

		return jsonResponse({ success: true, data: { updated: statements.length } });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function PATCH({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		const body = await request.json();

		const fields: string[] = [];
		const values: (string | number)[] = [];
		for (const key of ['code', 'title', 'discount_type', 'discount_value', 'bundle_id', 'course_offering_id', 'max_uses', 'starts_at', 'expires_at', 'is_active']) {
			if (body[key] !== undefined) {
				fields.push(`${key} = ?`);
				values.push(body[key]);
			}
		}
		if (fields.length === 0) return jsonResponse({ success: false, error: 'Tidak ada field' }, 400);

		values.push(id as string);
		await db.prepare(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		await db.prepare('DELETE FROM coupons WHERE id = ?').bind(id as string).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

/** PATCH /api/admin/bundles/[id] — update bundle */
export async function PATCH({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		const body = await request.json();

		const fields: string[] = [];
		const values: (string | number)[] = [];
		for (const key of ['title', 'slug', 'description', 'price', 'original_price', 'cover_icon', 'is_active']) {
			if (body[key] !== undefined) {
				fields.push(`${key} = ?`);
				values.push(body[key]);
			}
		}
		if (fields.length > 0) {
			values.push(id as string);
			await db.prepare(`UPDATE bundles SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).bind(...values).run();
		}

		// Replace items if provided
		if (Array.isArray(body.offering_ids)) {
			await db.prepare('DELETE FROM bundle_items WHERE bundle_id = ?').bind(id as string).run();
			for (const oid of body.offering_ids) {
				await db.prepare(
					'INSERT INTO bundle_items (id, bundle_id, course_offering_id) VALUES (?, ?, ?)'
				).bind(crypto.randomUUID(), id as string, oid).run();
			}
		}

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** DELETE /api/admin/bundles/[id] */
export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		await db.prepare('DELETE FROM bundles WHERE id = ?').bind(id as string).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

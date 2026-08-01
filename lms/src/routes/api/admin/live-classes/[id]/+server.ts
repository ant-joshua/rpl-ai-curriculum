import { getDB, jsonResponse } from '$lib/server/d1';

/** PATCH /api/admin/live-classes/[id] — update live class (status, join_url, recording_url) */
export async function PATCH({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		const body = await request.json();

		const fields: string[] = [];
		const values: (string | number)[] = [];
		for (const key of ['title', 'description', 'start_at', 'duration_minutes', 'join_url', 'recording_url', 'status', 'instructor_id']) {
			if (body[key] !== undefined) {
				fields.push(`${key} = ?`);
				values.push(body[key]);
			}
		}
		if (fields.length === 0) return jsonResponse({ success: false, error: 'Tidak ada field' }, 400);

		values.push(id as string);
		await db.prepare(`UPDATE live_classes SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).bind(...values).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** DELETE /api/admin/live-classes/[id] */
export async function DELETE({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();
		await db.prepare('DELETE FROM live_classes WHERE id = ?').bind(id as string).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const row = await db.prepare('SELECT * FROM enrollments WHERE id = ?').bind(params.id).first<any>();
		if (!row) return jsonResponse({ success: false, error: 'Not found' }, 404);
		return jsonResponse({ success: true, data: row });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function PUT({ request, params, platform }: { request: Request; params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const existing = await db.prepare('SELECT * FROM enrollments WHERE id = ?').bind(params.id).first<any>();
		if (!existing) return jsonResponse({ success: false, error: 'Not found' }, 404);

		const body = await request.json();
		const merged = { ...existing, ...body };

		// Auto-set completed_at when status transitions to completed
		if (merged.status === 'completed' && !merged.completed_at) {
			merged.completed_at = new Date().toISOString();
		}

		await db.prepare(
			'UPDATE enrollments SET user_id = ?, course_offering_id = ?, role = ?, status = ?, enrolled_at = ?, dropped_at = ?, completed_at = ?, final_grade = ?, final_score = ? WHERE id = ?'
		).bind(
			merged.user_id, merged.course_offering_id, merged.role, merged.status,
			merged.enrolled_at, merged.dropped_at, merged.completed_at,
			merged.final_grade, merged.final_score,
			merged.id
		).run();
		return jsonResponse({ success: true, data: merged });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function DELETE({ params, platform }: { params: { id: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		await db.prepare('DELETE FROM enrollments WHERE id = ?').bind(params.id).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

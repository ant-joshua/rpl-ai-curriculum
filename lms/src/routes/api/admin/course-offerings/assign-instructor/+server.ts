import { jsonResponse, getDB } from '$lib/server/d1';

export async function POST({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const db = getDB(platform);
		const body = await request.json();
		const { offering_id, instructor_id } = body;

		if (!offering_id || !instructor_id) {
			return jsonResponse({ success: false, error: 'offering_id and instructor_id required' }, 400);
		}

		const now = new Date().toISOString();
		await db.prepare(
			'UPDATE course_offerings SET instructor_id = ?, updated_at = ? WHERE id = ?'
		).bind(instructor_id, now, offering_id).run();

		return jsonResponse({ success: true, message: 'Instruktur berhasil ditetapkan' });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

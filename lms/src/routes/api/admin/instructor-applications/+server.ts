import { jsonResponse, getDB } from '$lib/server/d1';

export async function GET({ platform, url }: { platform: App.Platform; url: URL }) {
	try {
		const db = getDB(platform);
		const statusFilter = url.searchParams.get('status') || 'pending';

		const { results } = await db.prepare(
			`SELECT ia.*, u.display_name AS user_name, u.email AS user_email,
			        co.name AS offering_name, co.code AS offering_code
			 FROM instructor_applications ia
			 JOIN users u ON u.id = ia.user_id
			 LEFT JOIN course_offerings co ON co.id = ia.course_offering_id
			 WHERE ia.status = ?
			 ORDER BY ia.created_at DESC`
		).bind(statusFilter).all<any>();

		return jsonResponse({ success: true, data: results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

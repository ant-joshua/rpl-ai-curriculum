import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** GET /api/my/certificates — user's certificates */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const { results } = await db.prepare(
			`SELECT c.id, c.cert_number, c.issued_at, c.metadata, c.course_offering_id,
			        co.name AS offering_name
			 FROM certificates c
			 LEFT JOIN course_offerings co ON co.id = c.course_offering_id
			 WHERE c.user_id = ?
			 ORDER BY c.issued_at DESC`
		).bind(session.user.id).all<any>();

		const certs = (results || []).map((r: any) => {
			let meta: any = {};
			try { meta = JSON.parse(r.metadata || '{}'); } catch { /* ignore */ }
			return {
				id: r.id,
				certNumber: r.cert_number,
				issuedAt: r.issued_at,
				offeringName: r.offering_name || '',
				courseTitle: meta.courseTitle || '',
				courseIcon: meta.courseIcon || '🏆',
				userName: meta.userName || '',
				instructorName: meta.instructorName || '',
			};
		});
		return jsonResponse({ success: true, data: certs });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

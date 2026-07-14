import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function load({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return { certificates: [], error: 'Not authenticated' };
		}

		const session = await getSession(platform, token);
		if (!session) {
			return { certificates: [], error: 'Session expired' };
		}

		const db = getDB(platform);
		const userId = session.session.user_id;

		const result = await db.prepare(
			`SELECT c.id, c.certificate_number, c.issued_at, c.course_offering_id,
			        co.name AS offering_name, co.code AS offering_code,
			        cr.title AS course_title, cr.icon AS course_icon
			 FROM certificates c
			 JOIN course_offerings co ON co.id = c.course_offering_id
			 JOIN courses cr ON cr.id = co.course_id
			 WHERE c.user_id = ?
			 ORDER BY c.issued_at DESC`
		).bind(userId).all();

		return { certificates: result.results || [], error: null };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return { certificates: [], error: msg };
	}
}

import { getDB } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	const db = getDB(platform);
	const { id } = params;

	try {
		const cert = await cachedDbFirst<any>(
			db,
			`SELECT c.id, c.certificate_number, c.issued_at, c.user_id, c.course_offering_id, c.metadata,
			        co.name AS offering_name, co.code AS offering_code,
			        cr.title AS course_title, cr.description AS course_description,
			        cr.icon AS course_icon, cr.slug AS course_slug,
			        u.username, u.display_name
			 FROM certificates c
			 JOIN course_offerings co ON co.id = c.course_offering_id
			 JOIN courses cr ON cr.id = co.course_id
			 JOIN users u ON u.id = c.user_id
			 WHERE c.id = ?`,
			[id],
			600_000 // 10 minutes cache
		);

		if (!cert) {
			return { cert: null, error: 'Certificate not found' };
		}

		return {
			cert: {
				id: cert.id,
				certificate_number: cert.certificate_number,
				issued_at: cert.issued_at,
				student_name: cert.display_name || cert.username || 'Student',
				offering_name: cert.offering_name,
				offering_code: cert.offering_code,
				course_title: cert.course_title,
				course_description: cert.course_description,
				course_icon: cert.course_icon,
			},
			error: null,
		};
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return { cert: null, error: msg };
	}
}

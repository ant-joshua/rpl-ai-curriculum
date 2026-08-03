import { getDB } from '$lib/server/d1';

export async function load({ params, platform }: {
	params: Record<string, string>;
	platform: App.Platform;
}) {
	if (!platform) return { cert: null, error: 'no-platform' };

	const db = getDB(platform);
	const cert = await db.prepare(
		`SELECT c.id, c.cert_number, c.issued_at, c.completed_at, c.metadata,
		        u.display_name AS user_display,
		        co.name AS offering_name
		 FROM certificates c
		 LEFT JOIN users u ON u.id = c.user_id
		 LEFT JOIN course_offerings co ON co.id = c.course_offering_id
		 WHERE c.id = ?`
	).bind(params.id).first<any>();

	if (!cert) return { cert: null, error: 'not-found' };

	let meta: any = {};
	try { meta = JSON.parse(cert.metadata || '{}'); } catch { /* ignore */ }

	return {
		cert: {
			id: cert.id,
			certNumber: cert.cert_number,
			issuedAt: cert.issued_at,
			completedAt: cert.completed_at,
			userName: meta.userName || cert.user_display || '',
			courseTitle: meta.courseTitle || cert.offering_name || '',
			courseIcon: meta.courseIcon || '🏆',
			instructorName: meta.instructorName || '',
		},
		error: null,
	};
}

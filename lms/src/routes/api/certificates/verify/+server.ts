import { getDB, jsonResponse } from '$lib/server/d1';

/** GET /api/certificates/verify?code=XXXX — public certificate verification */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const url = new URL(request.url);
		const code = url.searchParams.get('code') || '';

		if (!code) return jsonResponse({ success: false, error: 'Kode sertifikat wajib' }, 400);

		const cert = await db.prepare(
			`SELECT c.id, c.cert_number, c.issued_at, c.completed_at, c.metadata,
			        u.display_name AS user_display, co.name AS offering_name, c.course_offering_id
			 FROM certificates c
			 LEFT JOIN users u ON u.id = c.user_id
			 LEFT JOIN course_offerings co ON co.id = c.course_offering_id
			 WHERE c.cert_number = ? COLLATE NOCASE`
		).bind(code).first<any>();

		if (!cert) {
			return jsonResponse({ success: false, error: 'Sertifikat tidak ditemukan' }, 404);
		}

		let meta: any = {};
		try { meta = JSON.parse(cert.metadata || '{}'); } catch { /* ignore */ }

		return jsonResponse({
			success: true,
			data: {
				certNumber: cert.cert_number,
				issuedAt: cert.issued_at,
				completedAt: cert.completed_at,
				userName: meta.userName || cert.user_display || '',
				courseTitle: meta.courseTitle || cert.offering_name || '',
				courseIcon: meta.courseIcon || '🏆',
				instructorName: meta.instructorName || '',
				valid: true,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

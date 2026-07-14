import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { randomUUID } from 'crypto';

/** GET /api/my/certificates — list certificates for current user */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);
		const userId = session.session.user_id;

		const result = await db.prepare(
			`SELECT c.id, c.certificate_number, c.issued_at, c.course_offering_id,
			        co.name AS offering_name, co.code AS offering_code,
			        co.id AS offering_id,
			        cr.title AS course_title, cr.icon AS course_icon, cr.slug AS course_slug
			 FROM certificates c
			 JOIN course_offerings co ON co.id = c.course_offering_id
			 JOIN courses cr ON cr.id = co.course_id
			 WHERE c.user_id = ?
			 ORDER BY c.issued_at DESC`
		).bind(userId).all();

		return jsonResponse({ success: true, data: result.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/** POST /api/my/certificates — generate a certificate */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const body = await request.json();
		const offeringId = body.course_offering_id;
		if (!offeringId) {
			return jsonResponse({ success: false, error: 'course_offering_id is required' }, 400);
		}

		const db = getDB(platform);
		const userId = session.session.user_id;

		// Verify enrollment
		const enrollment = await db.prepare(
			'SELECT status FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();

		if (!enrollment) {
			return jsonResponse({ success: false, error: 'Not enrolled in this course offering' }, 403);
		}

		// Check all lessons completed
		const { results: lessons } = await db.prepare(
			'SELECT id, slug FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
		).bind(offeringId, 'published').all<any>();

		const lessonSlugs = (lessons || []).map(l => l.slug);
		if (lessonSlugs.length === 0) {
			return jsonResponse({ success: false, error: 'No lessons in this offering' }, 400);
		}

		const placeholders = lessonSlugs.map(() => '?').join(',');
		const { results: completedRows } = await db.prepare(
			`SELECT DISTINCT session_id FROM progress WHERE user_id = ? AND session_id IN (${placeholders}) AND completed = 1`
		).bind(userId, ...lessonSlugs).all<any>();

		const completedSlugs = new Set((completedRows || []).map(r => r.session_id));
		const allCompleted = lessonSlugs.every(slug => completedSlugs.has(slug));

		if (!allCompleted) {
			return jsonResponse({ success: false, error: 'Not all lessons completed' }, 403);
		}

		// Check existing certificate
		const existing = await db.prepare(
			'SELECT id FROM certificates WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();

		if (existing) {
			return jsonResponse({
				success: true,
				data: { id: existing.id, url: `/certificate/${existing.id}`, message: 'Certificate already exists' }
			});
		}

		// Get offering code for certificate number
		const offering = await db.prepare(
			'SELECT code FROM course_offerings WHERE id = ?'
		).bind(offeringId).first<any>();

		if (!offering || !offering.code) {
			return jsonResponse({ success: false, error: 'Course offering has no code' }, 400);
		}

		// Generate sequential certificate number
		const year = new Date().getFullYear();
		const { results: existingCerts } = await db.prepare(
			`SELECT certificate_number FROM certificates WHERE certificate_number LIKE ? ORDER BY certificate_number DESC`
		).bind(`RPL/${year}/${offering.code}-%`).all<any>();

		let seq = 1;
		if (existingCerts && existingCerts.length > 0) {
			const lastNum = existingCerts[0].certificate_number;
			const parts = lastNum.split('-');
			seq = parseInt(parts[parts.length - 1], 10) + 1;
		}

		const certNumber = `RPL/${year}/${offering.code}-${String(seq).padStart(3, '0')}`;
		const certId = randomUUID();
		const now = new Date().toISOString();

		await db.prepare(
			'INSERT INTO certificates (id, user_id, course_offering_id, certificate_number, issued_at, metadata) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(certId, userId, offeringId, certNumber, now, '{}').run();

		return jsonResponse({
			success: true,
			data: { id: certId, certificate_number: certNumber, url: `/certificate/${certId}` }
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

function generateCertNumber(): string {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0');
	const d = String(now.getDate()).padStart(2, '0');
	const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `CERT-${y}${m}${d}-${rand}`;
}

/** POST /api/certificates/auto-issue — auto-issue cert when all lessons completed */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);

		const body: { offeringId?: string } = await request.json();
		if (!body.offeringId) {
			return jsonResponse({ success: false, error: 'offeringId is required' }, 400);
		}

		const { offeringId } = body;

		// Check enrollment
		const enrollment = await db.prepare(
			'SELECT status FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();

		if (!enrollment) {
			return jsonResponse({ success: false, error: 'Not enrolled in this course offering' }, 403);
		}

		// Count total published lessons
		const totalLesson = await db.prepare(
			'SELECT COUNT(*) as cnt FROM lessons WHERE course_offering_id = ? AND status = ?'
		).bind(offeringId, 'published').first<{ cnt: number }>();

		const totalLessons = totalLesson?.cnt ?? 0;
		if (totalLessons === 0) {
			return jsonResponse({ success: false, error: 'No published lessons in this offering' }, 400);
		}

		// Count completed lessons
		const completedResult = await db.prepare(
			`SELECT COUNT(DISTINCT p.session_id) as cnt
			 FROM progress p
			 JOIN lessons l ON l.slug = p.session_id AND l.course_offering_id = ?
			 WHERE p.user_id = ? AND p.completed = 1`
		).bind(offeringId, userId).first<{ cnt: number }>();

		const completedLessons = completedResult?.cnt ?? 0;

		if (completedLessons < totalLessons) {
			return jsonResponse({
				success: false,
				error: 'Not all lessons completed',
				data: { completedLessons, totalLessons }
			}, 403);
		}

		// Check for existing certificate
		const existing = await db.prepare(
			'SELECT id, certificate_number, issued_at FROM certificates WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();

		if (existing) {
			return jsonResponse({
				success: true,
				data: {
					id: existing.id,
					certificate_number: existing.certificate_number,
					issued_at: existing.issued_at,
					url: `/certificate/${existing.id}`,
					newlyIssued: false,
				}
			});
		}

		// Generate certificate
		const certId = crypto.randomUUID();
		const certNumber = generateCertNumber();
		const now = new Date().toISOString();

		await db.prepare(
			'INSERT INTO certificates (id, user_id, course_offering_id, certificate_number, issued_at, metadata) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(certId, userId, offeringId, certNumber, now, '{}').run();

		return jsonResponse({
			success: true,
			data: {
				id: certId,
				certificate_number: certNumber,
				issued_at: now,
				url: `/certificate/${certId}`,
				newlyIssued: true,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

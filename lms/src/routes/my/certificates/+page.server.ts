import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function load({ request, platform }: { request: Request; platform: App.Platform }) {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return { certificates: [], progressItems: [], error: 'Not authenticated' };
		}

		const session = await getSession(platform, token);
		if (!session) {
			return { certificates: [], progressItems: [], error: 'Session expired' };
		}

		const db = getDB(platform);
		const userId = session.session.user_id;

		// Get certificates
		const certResult = await db.prepare(
			`SELECT c.id, c.certificate_number, c.issued_at, c.course_offering_id,
			        co.name AS offering_name, co.code AS offering_code,
			        cr.title AS course_title, cr.icon AS course_icon
			 FROM certificates c
			 JOIN course_offerings co ON co.id = c.course_offering_id
			 JOIN courses cr ON cr.id = co.course_id
			 WHERE c.user_id = ?
			 ORDER BY c.issued_at DESC`
		).bind(userId).all();

		const certificates = certResult.results || [];

		// Get offerings user is enrolled in but doesn't have a cert for
		const certOfferingIds = certificates.map((c: any) => c.course_offering_id);
		let enrolledWithoutCert: any[] = [];

		if (certOfferingIds.length > 0) {
			const placeholders = certOfferingIds.map(() => '?').join(',');
			enrolledWithoutCert = (await db.prepare(
				`SELECT e.course_offering_id, co.name AS offering_name, co.code AS offering_code,
				        cr.title AS course_title, cr.icon AS course_icon, cr.slug AS course_slug
				 FROM enrollments e
				 JOIN course_offerings co ON co.id = e.course_offering_id
				 JOIN courses cr ON cr.id = co.course_id
				 WHERE e.user_id = ? AND e.course_offering_id NOT IN (${placeholders}) AND e.status = 'active'`
			).bind(userId, ...certOfferingIds).all<any>()).results || [];
		} else {
			enrolledWithoutCert = (await db.prepare(
				`SELECT e.course_offering_id, co.name AS offering_name, co.code AS offering_code,
				        cr.title AS course_title, cr.icon AS course_icon, cr.slug AS course_slug
				 FROM enrollments e
				 JOIN course_offerings co ON co.id = e.course_offering_id
				 JOIN courses cr ON cr.id = co.course_id
				 WHERE e.user_id = ? AND e.status = 'active'`
			).bind(userId).all<any>()).results || [];
		}

		// For each enrolled offering, compute progress summary
		const progressItems: any[] = [];
		for (const offering of enrolledWithoutCert || []) {
			const totalLesson = await db.prepare(
				'SELECT COUNT(*) as cnt FROM lessons WHERE course_offering_id = ? AND status = ?'
			).bind(offering.course_offering_id, 'published').first<{ cnt: number }>();

			const totalLessons = totalLesson?.cnt ?? 0;

			const completedResult = await db.prepare(
				`SELECT COUNT(DISTINCT p.session_id) as cnt
				 FROM progress p
				 JOIN lessons l ON l.slug = p.session_id AND l.course_offering_id = ?
				 WHERE p.user_id = ? AND p.completed = 1`
			).bind(offering.course_offering_id, userId).first<{ cnt: number }>();

			const completedLessons = completedResult?.cnt ?? 0;
			const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

			progressItems.push({
				offeringId: offering.course_offering_id,
				offeringName: offering.offering_name,
				courseTitle: offering.course_title,
				courseIcon: offering.course_icon || '📚',
				courseSlug: offering.course_slug,
				totalLessons,
				completedLessons,
				percentage,
			});
		}

		return { certificates, progressItems, error: null };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return { certificates: [], progressItems: [], error: msg };
	}
}

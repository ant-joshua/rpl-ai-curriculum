import { getDB, jsonResponse } from '$lib/server/d1';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

/** POST /api/certificates/issue — issue certificate when course completed */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getTokenFromRequest(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body = await request.json();
		const { offeringId } = body;
		if (!offeringId) return jsonResponse({ success: false, error: 'offeringId wajib' }, 400);

		// Check enrollment completed
		const enrollment = await db.prepare(
			`SELECT id, status FROM enrollments WHERE user_id = ? AND course_offering_id = ?`
		).bind(userId, offeringId).first<any>();
		if (!enrollment || enrollment.status !== 'completed') {
			return jsonResponse({ success: false, error: 'Kursus belum selesai' }, 400);
		}

		// Already issued?
		const existing = await db.prepare(
			'SELECT id, cert_number FROM certificates WHERE user_id = ? AND course_offering_id = ?'
		).bind(userId, offeringId).first<any>();
		if (existing) {
			return jsonResponse({ success: true, data: { id: existing.id, certNumber: existing.cert_number, alreadyIssued: true } });
		}

		// Course info snapshot
		const course = await db.prepare(
			`SELECT c.title, c.icon, u.display_name AS instructor_name
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 LEFT JOIN users u ON u.id = co.instructor_id
			 WHERE co.id = ?`
		).bind(offeringId).first<any>();
		if (!course) return jsonResponse({ success: false, error: 'Kursus tidak ditemukan' }, 404);

		const userName = session.user.name || 'Student';
		const certId = crypto.randomUUID();
		const certNumber = `RPL-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

		await db.prepare(
			`INSERT INTO certificates (id, cert_number, user_id, course_offering_id, completed_at, metadata)
			 VALUES (?, ?, ?, ?, datetime('now'), ?)`
		).bind(
			certId, certNumber, userId, offeringId,
			JSON.stringify({ courseTitle: course.title, courseIcon: course.icon || '📚', userName, instructorName: course.instructor_name || '' })
		).run();

		// Notify user about their new certificate
		const { NotificationRepository } = await import('$lib/repositories/notification.repository');
		const userTenant = await db.prepare('SELECT tenant_id FROM users WHERE id = ?').bind(userId).first<any>();
		await NotificationRepository.createNotification(platform, {
			tenant_id: userTenant?.tenant_id || 'default',
			user_id: userId,
			type: 'system',
			title: 'Sertifikat terbit! 🏆',
			body: `Selamat! Kamu menyelesaikan "${course.title}" dan mendapatkan sertifikat resmi.`,
			reference_type: 'certificate',
			reference_id: certId,
			channel: 'in_app',
			status: 'sent',
		});

		return jsonResponse({ success: true, data: { id: certId, certNumber } }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

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

		// Verify offering exists and is active
		const offering = await db
			.prepare('SELECT id, status FROM course_offerings WHERE id = ?')
			.bind(body.offeringId)
			.first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		if (offering.status !== 'active') {
			return jsonResponse({ success: false, error: 'Course offering is not open for enrollment' }, 400);
		}

		// Check for existing enrollment
		const existing = await db
			.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_offering_id = ?')
			.bind(userId, body.offeringId)
			.first<any>();

		if (existing) {
			return jsonResponse({ success: false, error: 'Already enrolled in this course' }, 409);
		}

		// Create enrollment
		const enrollmentId = crypto.randomUUID();
		const now = new Date().toISOString();

		await db
			.prepare(
				`INSERT INTO enrollments (id, user_id, course_offering_id, role, status, enrolled_at)
				 VALUES (?, ?, ?, 'student', 'active', ?)`
			)
			.bind(enrollmentId, userId, body.offeringId, now)
			.run();

		return jsonResponse({
			success: true,
			data: {
				enrollmentId,
				offeringId: body.offeringId,
				enrolledAt: now,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

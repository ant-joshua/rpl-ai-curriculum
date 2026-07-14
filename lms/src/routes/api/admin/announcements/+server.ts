import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ url, platform, request }: { url: URL; platform: App.Platform; request: Request }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const offeringId = url.searchParams.get('course_offering_id');
		let query = `
			SELECT a.*, u.display_name as creator_name
			FROM announcements a
			LEFT JOIN users u ON a.created_by = u.id
		`;
		const params: any[] = [];
		if (offeringId) {
			query += ' WHERE a.course_offering_id = ?';
			params.push(offeringId);
		}
		query += ' ORDER BY a.created_at DESC';

		const rows = await db.prepare(query).bind(...params).all();
		return jsonResponse({ success: true, data: rows.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Not authenticated' }, 401);

		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);

		const db = getDB(platform);
		const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
		if (!user || !['superadmin', 'admin'].includes(user.role)) {
			return jsonResponse({ success: false, error: 'Forbidden — admin role required' }, 403);
		}

		const body = await request.json();
		const { course_offering_id, title, body: announcementBody, priority } = body;

		if (!course_offering_id || !title || !announcementBody) {
			return jsonResponse({ success: false, error: 'course_offering_id, title, and body required' }, 400);
		}

		// Verify offering exists
		const offering = await db.prepare('SELECT id FROM course_offerings WHERE id = ?').bind(course_offering_id).first<any>();
		if (!offering) {
			return jsonResponse({ success: false, error: 'course_offering not found' }, 404);
		}

		const id = crypto.randomUUID();
		const validPriority = ['low', 'normal', 'high', 'urgent'].includes(priority) ? priority : 'normal';

		await db.prepare(
			'INSERT INTO announcements (id, course_offering_id, title, body, priority, created_by) VALUES (?, ?, ?, ?, ?, ?)'
		).bind(id, course_offering_id, title, announcementBody, validPriority, session.user.id).run();

		// Auto-notify: create notifications for all enrolled users in this offering
		const enrollments = await db
			.prepare('SELECT user_id FROM enrollments WHERE course_offering_id = ? AND status = ?')
			.bind(course_offering_id, 'active')
			.all<any>();

		if (enrollments.results && enrollments.results.length > 0) {
			const now = new Date().toISOString();
			const notifyStmt = db.prepare(
				'INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
			);
			const offeringName = await db
				.prepare('SELECT name FROM course_offerings WHERE id = ?')
				.bind(course_offering_id)
				.first<string>();
			const link = '/my/announcements';

			for (const enrollment of enrollments.results) {
				await notifyStmt.bind(
					crypto.randomUUID(),
					enrollment.user_id,
					'announcement',
					title,
					`Pengumuman baru untuk ${offeringName || offeringName}: ${title}`,
					link,
					now
				).run();
			}
		}

		const row = await db
			.prepare('SELECT a.*, u.display_name as creator_name FROM announcements a LEFT JOIN users u ON a.created_by = u.id WHERE a.id = ?')
			.bind(id)
			.first();

		return jsonResponse({ success: true, data: row }, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

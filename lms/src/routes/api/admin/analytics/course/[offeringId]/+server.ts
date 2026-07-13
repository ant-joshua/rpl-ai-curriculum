import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({
	platform,
	params,
}: { platform: App.Platform; params: { offeringId: string } }): Promise<Response> {
	try {
		const db = getDB(platform);

		const offering = await db
			.prepare('SELECT * FROM course_offerings WHERE id = ?')
			.bind(params.offeringId)
			.first();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering not found' }, 404);
		}

		const enrollmentCount = await db
			.prepare('SELECT COUNT(*) as count FROM enrollments WHERE course_offering_id = ?')
			.bind(params.offeringId)
			.first<{ count: number }>();

		const lessonCount = await db
			.prepare('SELECT COUNT(*) as count FROM lessons WHERE course_offering_id = ?')
			.bind(params.offeringId)
			.first<{ count: number }>();

		const progressRows = await db
			.prepare(
				`SELECT p.module_slug, p.user_id, p.completed, p.completed_at, u.display_name
				 FROM progress p
				 JOIN users u ON p.user_id = u.id
				 WHERE p.module_slug IN (
				   SELECT slug FROM lessons WHERE course_offering_id = ?
				 )
				 ORDER BY p.completed_at DESC LIMIT 50`,
			)
			.bind(params.offeringId)
			.all();

		const recentEnrollments = await db
			.prepare(
				`SELECT e.*, u.display_name, u.email
				 FROM enrollments e
				 JOIN users u ON e.user_id = u.id
				 WHERE e.course_offering_id = ?
				 ORDER BY e.enrolled_at DESC LIMIT 10`,
			)
			.bind(params.offeringId)
			.all();

		return jsonResponse({
			success: true,
			data: {
				offering,
				enrollmentCount: enrollmentCount?.count ?? 0,
				lessonCount: lessonCount?.count ?? 0,
				progress: progressRows.results ?? [],
				recentEnrollments: recentEnrollments.results ?? [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

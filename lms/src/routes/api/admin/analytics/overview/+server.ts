import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalUsers = await db
			.prepare('SELECT COUNT(*) as count FROM users')
			.first<{ count: number }>();

		const activeEnrollments = await db
			.prepare("SELECT COUNT(*) as count FROM enrollments WHERE status = ?")
			.bind('active')
			.first<{ count: number }>();

		const totalCourses = await db
			.prepare('SELECT COUNT(*) as count FROM courses')
			.first<{ count: number }>();

		const totalLessons = await db
			.prepare("SELECT COUNT(*) as count FROM lessons WHERE status = ?")
			.bind('published')
			.first<{ count: number }>();

		const pendingGrades = await db
			.prepare("SELECT COUNT(*) as count FROM assessment_submissions WHERE status = 'submitted'")
			.first<{ count: number }>();

		const newUsers = await db
			.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')")
			.first<{ count: number }>();

		const recentActivity = await db
			.prepare(
				`SELECT ual.*, u.display_name, u.email, u.avatar_url
				 FROM user_activity_log ual
				 LEFT JOIN users u ON ual.user_id = u.id
				 ORDER BY ual.created_at DESC LIMIT 20`,
			)
			.all();

		return jsonResponse({
			success: true,
			data: {
				totalUsers: totalUsers?.count ?? 0,
				activeEnrollments: activeEnrollments?.count ?? 0,
				totalCourses: totalCourses?.count ?? 0,
				totalLessons: totalLessons?.count ?? 0,
				pendingGrades: pendingGrades?.count ?? 0,
				newUsers: newUsers?.count ?? 0,
				recentActivity: recentActivity.results ?? [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

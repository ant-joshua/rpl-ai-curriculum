import { getDB, jsonResponse } from '$lib/server/d1';
import type { D1Database } from '@cloudflare/workers-types';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const totalUsers = await db
			.prepare('SELECT COUNT(*) as count FROM users')
			.first<{ count: number }>();

		const totalSessions = await db
			.prepare('SELECT COUNT(*) as count FROM progress WHERE completed = 1')
			.first<{ count: number }>();

		const totalXp = await db
			.prepare("SELECT COALESCE(SUM(xp), 0) as total FROM user_xp")
			.first<{ total: number }>();

		const activeToday = await db
			.prepare("SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE completed_at > datetime('now', '-1 day')")
			.first<{ count: number }>();

		const recentUsers = await db
			.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 20')
			.all();

		const topExercises = await db
			.prepare('SELECT exercise_slug, COUNT(*) as count FROM submissions GROUP BY exercise_slug ORDER BY count DESC LIMIT 10')
			.all();

		// Total projects completed
		const totalProjects = await db
			.prepare('SELECT COUNT(*) as count FROM project_completions')
			.first<{ count: number }>();

		// Active streak users (activity in last 7 days)
		const activeWeek = await db
			.prepare("SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE completed_at > datetime('now', '-7 days')")
			.first<{ count: number }>();

		// Module completion stats
		const moduleStats = await db
			.prepare('SELECT module_slug, COUNT(*) as completions FROM progress WHERE completed = 1 GROUP BY module_slug ORDER BY completions DESC LIMIT 10')
			.all();

		let badgeDist: { badge_id: string; count: number; name?: string }[] = [];
		try {
			const badgeResult = await db
				.prepare('SELECT badge_id, COUNT(*) as count FROM badges GROUP BY badge_id ORDER BY count DESC')
				.all<{ badge_id: string; count: number }>();
			badgeDist = (badgeResult.results || []).map(b => ({ badge_id: b.badge_id, count: b.count }));
		} catch {
			badgeDist = [];
		}

		// Recent activity
		const recentActivity = await db
			.prepare('SELECT a.*, u.username FROM activity_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 20')
			.all();

		return jsonResponse({
			success: true,
			data: {
				total_users: totalUsers?.count ?? 0,
				total_sessions: totalSessions?.count ?? 0,
				total_xp: totalXp?.total ?? 0,
				active_today: activeToday?.count ?? 0,
				active_week: activeWeek?.count ?? 0,
				total_projects: totalProjects?.count ?? 0,
				recent_users: recentUsers.results ?? [],
				top_exercises: topExercises.results ?? [],
				badge_distribution: badgeDist,
				module_stats: moduleStats.results ?? [],
				recent_activity: recentActivity.results ?? [],
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

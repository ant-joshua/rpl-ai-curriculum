import { getDB } from '$lib/server/d1';

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

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

		// Badge distribution
		let badgeDist: { badge_id: string; count: number; name?: string }[] = [];
		try {
			const badgeResult = await db
				.prepare('SELECT badge_id, COUNT(*) as count FROM badges GROUP BY badge_id ORDER BY count DESC')
				.all<{ badge_id: string; count: number }>();
			badgeDist = (badgeResult.results || []).map(b => ({ badge_id: b.badge_id, count: b.count }));
		} catch {
			badgeDist = [];
		}

		return json({
			success: true,
			data: {
				total_users: totalUsers?.count ?? 0,
				total_sessions: totalSessions?.count ?? 0,
				total_xp: totalXp?.total ?? 0,
				active_today: activeToday?.count ?? 0,
				recent_users: recentUsers.results ?? [],
				top_exercises: topExercises.results ?? [],
				badge_distribution: badgeDist,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

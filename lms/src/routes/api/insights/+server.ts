import { getDB, getDeviceId } from '$lib/server/d1';
import { modules } from '$lib/stores/modules';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, x-device-id',
	};
}

function json(data: unknown, status = 200): Response {
	const body = JSON.stringify(data);
	return new Response(body, {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders() },
	});
}

export async function OPTIONS(): Promise<Response> {
	return new Response(null, { headers: corsHeaders() });
}

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);
		const deviceId = getDeviceId(request);

		// Total study time: count activity_log entries
		const logCount = await db
			.prepare('SELECT COUNT(*) as count FROM activity_log WHERE user_id = ?')
			.bind(deviceId)
			.first<{ count: number }>();
		const totalStudyTime = logCount?.count || 0;

		// Sessions done (unique session completions)
		const sessionsDone = await db
			.prepare('SELECT COUNT(DISTINCT module_slug || session_id) as count FROM activity_log WHERE user_id = ? AND action = ?')
			.bind(deviceId, 'complete')
			.first<{ count: number }>();
		const sessionCount = sessionsDone?.count || 0;

		// Daily average over last 7 days
		const dailyActivity = await db
			.prepare(`SELECT DATE(created_at) as day, COUNT(*) as count 
				FROM activity_log 
				WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
				GROUP BY DATE(created_at) ORDER BY day`)
			.bind(deviceId)
			.all<{ day: string; count: number }>();
		const dailyResults = dailyActivity?.results || [];
		let dailyAverage = 0;
		if (dailyResults.length > 0) {
			const total = dailyResults.reduce((sum, r) => sum + r.count, 0);
			dailyAverage = Math.round(total / 7);
		}

		// Streak: consecutive days with activity
		const allDays = await db
			.prepare(`SELECT DISTINCT DATE(created_at) as day 
				FROM activity_log 
				WHERE user_id = ? 
				ORDER BY day DESC`)
			.bind(deviceId)
			.all<{ day: string }>();
		const dayList = allDays?.results || [];
		let streak = 0;
		const today = new Date().toISOString().split('T')[0];
		// Check if today or yesterday has activity to start streak
		for (let i = 0; i < dayList.length; i++) {
			const expected = new Date();
			expected.setDate(expected.getDate() - streak);
			const expectedStr = expected.toISOString().split('T')[0];
			if (dayList[i]?.day === expectedStr) {
				streak++;
			} else {
				break;
			}
		}
		if (streak === 0 && dayList.length > 0) {
			// Check if last activity was yesterday or today
			const lastDay = dayList[0]?.day;
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split('T')[0];
			if (lastDay === today || lastDay === yesterdayStr) {
				streak = 1;
			}
		}

		// Weak topics: modules with <50% completion
		const weakTopics: { slug: string; title: string; completion: number }[] = [];
		for (const mod of modules) {
			if (mod.sessions.length === 0) continue;
			const completed = await db
				.prepare('SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND module_slug = ? AND completed = 1')
				.bind(deviceId, mod.slug)
				.first<{ count: number }>();
			const completedCount = completed?.count || 0;
			const pct = Math.round((completedCount / mod.sessions.length) * 100);
			if (completedCount > 0 && pct < 50) {
				weakTopics.push({ slug: mod.slug, title: mod.title, completion: pct });
			}
		}

		// Prediction: estimate completion date per path
		const { paths } = await import('$lib/stores/paths');
		const predictions: { slug: string; title: string; estimatedCompletion: string; sessionsDone: number; totalSessions: number }[] = [];
		const sessionsPerDay = dailyAverage > 0 ? dailyAverage : 1;
		for (const path of paths) {
			let totalSessions = 0;
			let completedInPath = 0;
			for (const modSlug of path.modules) {
				const mod = modules.find(m => m.slug === modSlug);
				if (!mod) continue;
				totalSessions += mod.sessions.length;
				const done = await db
					.prepare('SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND module_slug = ? AND completed = 1')
					.bind(deviceId, modSlug)
					.first<{ count: number }>();
				completedInPath += done?.count || 0;
			}
			if (totalSessions > 0) {
				const remaining = totalSessions - completedInPath;
				const daysNeeded = Math.ceil(remaining / sessionsPerDay);
				const estDate = new Date();
				estDate.setDate(estDate.getDate() + daysNeeded);
				predictions.push({
					slug: path.slug,
					title: path.title,
					estimatedCompletion: estDate.toISOString().split('T')[0],
					sessionsDone: completedInPath,
					totalSessions,
				});
			}
		}

		// Recent activity (last 20)
		const recentLog = await db
			.prepare('SELECT * FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
			.bind(deviceId)
			.all();

		// Activity by hour
		const hourActivity = await db
			.prepare(`SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
				FROM activity_log WHERE user_id = ?
				GROUP BY hour ORDER BY hour`)
			.bind(deviceId)
			.all<{ hour: number; count: number }>();
		const hourData: number[] = new Array(24).fill(0);
		for (const row of (hourActivity?.results || [])) {
			if (row.hour >= 0 && row.hour < 24) {
				hourData[row.hour] = row.count;
			}
		}

		// Activity heatmap data (last 365 days)
		const activityHeatmap = await db
			.prepare(`SELECT DATE(created_at) as day, COUNT(*) as count
				FROM activity_log WHERE user_id = ? AND created_at >= datetime('now', '-365 days')
				GROUP BY DATE(created_at) ORDER BY day`)
			.bind(deviceId)
			.all<{ day: string; count: number }>();
		const heatmapData: Record<string, number> = {};
		for (const row of (activityHeatmap?.results || [])) {
			heatmapData[row.day] = row.count;
		}

		return json({
			success: true,
			data: {
				total_study_time: totalStudyTime,
				sessions_done: sessionCount,
				streak,
				daily_average: dailyAverage,
				weak_topics: weakTopics,
				predictions,
				recent_activity: recentLog?.results || [],
				hour_activity: hourData,
				heatmap_data: heatmapData,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

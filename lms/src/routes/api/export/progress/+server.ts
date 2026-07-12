import { getDB, getDeviceId } from '$lib/server/d1';

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
		const url = new URL(request.url);
		const deviceId = url.searchParams.get('device_id') || getDeviceId(request);
		const format = url.searchParams.get('format');

		// Get user data
		const user = await db
			.prepare('SELECT id, username, created_at FROM users WHERE id = ?')
			.bind(deviceId)
			.first<{ id: string; username: string; created_at: string }>();

		// Get completed progress
		const { results: progressRows } = await db
			.prepare("SELECT module_slug, session_id, completed_at FROM progress WHERE user_id = ? AND completed = 1 ORDER BY completed_at ASC")
			.bind(deviceId)
			.all<{ module_slug: string; session_id: string; completed_at: string | null }>();

		// Get activity count
		const activityRow = await db
			.prepare('SELECT COUNT(*) as count FROM activity_log WHERE user_id = ?')
			.bind(deviceId)
			.first<{ count: number }>();

		// Get streak from localStorage equivalent (use activity for completed days)
		const { results: activityDays } = await db
			.prepare("SELECT DISTINCT DATE(created_at) as day FROM activity_log WHERE user_id = ? AND action = 'complete' ORDER BY day DESC")
			.bind(deviceId)
			.all<{ day: string }>();

		const totalSessionsCompleted = progressRows.length;
		const modulesCompleted = new Set(progressRows.map(r => r.module_slug)).size;

		// Get last export timestamp from activity_log (action='export' if exists)
		const lastExport = await db
			.prepare("SELECT created_at FROM activity_log WHERE user_id = ? AND action = 'export' ORDER BY created_at DESC LIMIT 1")
			.bind(deviceId)
			.first<{ created_at: string }>();

		const exportData = {
			exportedAt: new Date().toISOString(),
			user: user || null,
			stats: {
				totalSessionsCompleted,
				modulesCompleted,
				totalActivities: activityRow?.count || 0,
				activeDays: activityDays.length,
			},
			completedSessions: progressRows.map(r => ({
				module_slug: r.module_slug,
				session_id: r.session_id,
				completed_at: r.completed_at,
			})),
			lastExport: lastExport?.created_at || null,
		};

		// CSV format
		if (format === 'csv') {
			let csv = 'module_slug,session_id,completed_at\n';
			for (const row of progressRows) {
				csv += `${row.module_slug},${row.session_id},${row.completed_at || ''}\n`;
			}
			return new Response(csv, {
				headers: {
					'Content-Type': 'text/csv',
					'Content-Disposition': `attachment; filename="progress-${deviceId.slice(0, 8)}.csv"`,
					...corsHeaders(),
				},
			});
		}

		// Return JSON with export data
		return json({ success: true, data: exportData });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return json({ success: false, error: msg }, 500);
	}
}

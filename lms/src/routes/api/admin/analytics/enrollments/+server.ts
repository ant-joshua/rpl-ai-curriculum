import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const rows = await db
			.prepare(
				`SELECT DATE(created_at) as date, COUNT(*) as count
				 FROM enrollments
				 WHERE created_at >= datetime('now', '-30 days')
				 GROUP BY DATE(created_at)
				 ORDER BY date ASC`,
			)
			.all();

		return jsonResponse({
			success: true,
			data: rows.results ?? [],
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const rows = await db
			.prepare(
				`SELECT DATE(enrolled_at) as date, COUNT(*) as count
				 FROM enrollments
				 WHERE enrolled_at >= datetime('now', '-30 days')
				 GROUP BY DATE(enrolled_at)
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

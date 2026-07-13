import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ platform }: { platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		const rows = await db
			.prepare(
				`SELECT co.name as offering_name, co.id as offering_id,
					COUNT(DISTINCT p.user_id) as active_students,
					AVG(CASE WHEN p.completed = 1 THEN 1.0 ELSE 0 END) as completion_rate
				 FROM lessons l
				 JOIN course_offerings co ON l.course_offering_id = co.id
				 LEFT JOIN progress p ON p.module_slug = l.slug
				 GROUP BY co.id
				 ORDER BY completion_rate DESC`,
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

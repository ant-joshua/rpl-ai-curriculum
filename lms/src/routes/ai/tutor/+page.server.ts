import { getDB } from '$lib/server/d1';

export async function load({ platform }: { platform: App.Platform }) {
	const db = getDB(platform);

	// Fetch available course offerings for context selection
	const offerings = await db
		.prepare(
			`SELECT co.id, co.name, c.title AS course_title
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 WHERE co.status = 'active'
			 ORDER BY co.name ASC`
		)
		.all<any>();

	return {
		offerings: offerings.results || [],
	};
}

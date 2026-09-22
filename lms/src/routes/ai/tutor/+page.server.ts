import { getDB } from '$lib/server/d1';
import { cachedDbQuery } from '$lib/server/cache';

export async function load({ platform }: { platform: App.Platform }) {
	const db = getDB(platform);

	// Fetch available course offerings with 5-min in-memory cache
	const { results: offerings } = await cachedDbQuery<any>(
		db,
		`SELECT co.id, co.name, c.title AS course_title
		 FROM course_offerings co
		 JOIN courses c ON c.id = co.course_id
		 WHERE co.status = 'active'
		 ORDER BY co.name ASC`,
		[],
		300_000
	);

	return {
		offerings: offerings || [],
	};
}

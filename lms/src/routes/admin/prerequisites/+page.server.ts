import { getDB } from '$lib/server/d1';

export async function load({ platform }: { platform: App.Platform }) {
	const db = getDB(platform);

	const offerings = await db
		.prepare('SELECT id, name, code FROM course_offerings WHERE status = ?')
		.bind('active')
		.all();

	const lessons = await db
		.prepare('SELECT id, title, slug, course_offering_id, order_index FROM lessons ORDER BY course_offering_id, order_index')
		.all();

	const prerequisites = await db
		.prepare(
			`SELECT p.*, pl.title as prereq_title, dl.title as dependent_title
			 FROM prerequisites p
			 LEFT JOIN lessons pl ON p.prerequisite_id = pl.id
			 LEFT JOIN lessons dl ON p.dependent_id = dl.id`
		)
		.all();

	return {
		offerings: offerings.results || [],
		lessons: lessons.results || [],
		prerequisites: prerequisites.results || []
	};
}

import { getDB } from '$lib/server/d1';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	const db = getDB(platform);

	const offering = await db.prepare(
		'SELECT * FROM course_offerings WHERE id = ?'
	).bind(params.offeringId).first<any>();

	if (!offering) {
		return { status: 404 };
	}

	const course = await db.prepare(
		'SELECT * FROM courses WHERE id = ?'
	).bind(offering.course_id).first<any>();

	const lessons = await db.prepare(
		'SELECT id, title, slug, order_index, duration_minutes, status FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
	).bind(params.offeringId, 'published').all();

	return {
		offering,
		course,
		lessons: lessons.results || []
	};
}

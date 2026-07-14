import { getDB } from '$lib/server/d1';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	const db = getDB(platform);

	// Find lesson by slug and offering
	const lesson = await db.prepare(
		'SELECT * FROM lessons WHERE slug = ? AND course_offering_id = ? AND status = ?'
	).bind(params.slug, params.offeringId, 'published').first<any>();

	if (!lesson) {
		return { status: 404, error: new Error('Lesson not found') };
	}

	// Get course offering info
	const offering = await db.prepare(
		'SELECT * FROM course_offerings WHERE id = ?'
	).bind(params.offeringId).first<any>();

	// Get course info
	let course = null;
	if (offering) {
		course = await db.prepare(
			'SELECT * FROM courses WHERE id = ?'
		).bind(offering.course_id).first<any>();
	}

	// Get content block — by direct link or title fallback
	let contentBlock = null;
	if (lesson.content_block_id) {
		contentBlock = await db.prepare(
			'SELECT * FROM content_blocks WHERE id = ? AND visibility = ?'
		).bind(lesson.content_block_id, 'published').first<any>();
	}
	if (!contentBlock) {
		// Fallback: find by title match (for modules migrated from static JSON)
		contentBlock = await db.prepare(
			"SELECT * FROM content_blocks WHERE title = ? AND visibility = ? LIMIT 1"
		).bind(lesson.title, 'published').first<any>();
	}

	// Get all lessons for navigation
	const allLessons = await db.prepare(
		'SELECT id, title, slug, order_index, duration_minutes FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
	).bind(params.offeringId, 'published').all();

	return {
		lesson,
		offering,
		course,
		contentBlock,
		allLessons: allLessons.results || []
	};
}

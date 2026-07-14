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

	// Get content blocks — try multi-block junction first, then single fallback
	let contentBlocks: any[] = [];

	// Check if lesson has entries in the junction table
	const junctionBlocks = await db.prepare(
		`SELECT cb.*, lcb.order_index, lcb.type_override
		 FROM lesson_content_blocks lcb
		 JOIN content_blocks cb ON cb.id = lcb.content_block_id
		 WHERE lcb.lesson_id = ? AND cb.visibility = ?
		 ORDER BY lcb.order_index ASC`
	).bind(lesson.id, 'published').all<any>();

	if (junctionBlocks.results && junctionBlocks.results.length > 0) {
		contentBlocks = junctionBlocks.results.map((row: any) => ({
			...row,
			// Allow type_override to override the content_block's type
			type: row.type_override || row.type
		}));
	} else {
		// Fallback: single content block (legacy)
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
		if (contentBlock) {
			contentBlocks = [contentBlock];
		}
	}

	// Get all lessons for navigation
	const allLessons = await db.prepare(
		'SELECT id, title, slug, order_index, duration_minutes FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
	).bind(params.offeringId, 'published').all();

	return {
		lesson,
		offering,
		course,
		contentBlocks,
		allLessons: allLessons.results || []
	};
}

import { getDB } from '$lib/server/d1';
import { error } from '@sveltejs/kit';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	// platform can be undefined in some CF Pages contexts
	if (!platform) {
		throw error(500, 'Platform context not available');
	}

	try {
		const db = getDB(platform);
		const offeringId = params.offeringId;
		const slug = params.slug;

		// Load offering
		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?')
			.bind(offeringId).first<any>();

		if (!offering) throw error(404, 'Course offering not found');

		// Load course
		const course = await db.prepare('SELECT * FROM courses WHERE id = ?')
			.bind(offering.course_id).first<any>();

		// Find lesson by slug
		const lesson = await db.prepare(
			'SELECT * FROM lessons WHERE slug = ? AND course_offering_id = ? AND status = ?'
		).bind(slug, offeringId, 'published').first<any>();

		if (!lesson) throw error(404, 'Lesson not found');

		// Get content blocks
		let contentBlocks: any[] = [];
		const junction = await db.prepare(
			`SELECT cb.*, lcb.order_index, lcb.type_override
			 FROM lesson_content_blocks lcb
			 JOIN content_blocks cb ON cb.id = lcb.content_block_id
			 WHERE lcb.lesson_id = ? AND cb.visibility = ?
			 ORDER BY lcb.order_index ASC`
		).bind(lesson.id, 'published').all<any>();

		if (junction.results?.length) {
			contentBlocks = junction.results.map((r: any) => ({ ...r, type: r.type_override || r.type }));
		} else if (lesson.content_block_id) {
			const cb = await db.prepare('SELECT * FROM content_blocks WHERE id = ? AND visibility = ?')
				.bind(lesson.content_block_id, 'published').first<any>();
			if (cb) contentBlocks = [cb];
		}

		// All lessons for navigation
		const all = await db.prepare(
			'SELECT id, title, slug, order_index, duration_minutes FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
		).bind(offeringId, 'published').all();

		return { lesson, offering, course, contentBlocks, allLessons: all.results || [] };
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(500, 'Failed to load lesson: ' + msg);
	}
}

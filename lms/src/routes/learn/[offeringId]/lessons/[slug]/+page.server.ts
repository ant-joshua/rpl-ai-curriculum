import { getDB } from '$lib/server/d1';
import { error } from '@sveltejs/kit';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	if (!platform) throw error(500, 'Platform context not available');

	try {
		const db = getDB(platform);
		const offeringId = params.offeringId;
		const slug = params.slug;

		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?')
			.bind(offeringId).first<any>();
		if (!offering) throw error(404, 'Course offering not found');

		const course = await db.prepare('SELECT * FROM courses WHERE id = ?')
			.bind(offering.course_id).first<any>();

		// Find lesson via content_blocks tree (type='lesson')
		let lessonBlock = await db.prepare(
			"SELECT * FROM content_blocks WHERE slug = ? AND course_offering_id = ? AND type = 'lesson' AND visibility = 'published'"
		).bind(slug, offeringId).first<any>();

		// Fallback: legacy lessons table
		let contentBlocks: any[] = [];
		let allLessons: any[] = [];

		if (lessonBlock) {
			// Get children blocks (text/video/quiz/etc)
			const children = await db.prepare(
				'SELECT * FROM content_blocks WHERE parent_id = ? AND visibility = ? ORDER BY order_index ASC'
			).bind(lessonBlock.id, 'published').all<any>();

			if (children.results?.length) {
				contentBlocks = children.results;
			} else if (lessonBlock.body_html || lessonBlock.body) {
				// Lesson block itself has content (inline)
				contentBlocks = [lessonBlock];
			}

			// Get all lessons in this offering for nav (siblings + cousins)
			const allBlocks = await db.prepare(
				"SELECT id, title, slug, order_index, duration_min, parent_id, is_optional FROM content_blocks WHERE course_offering_id = ? AND type = 'lesson' AND visibility = 'published' ORDER BY order_index ASC"
			).bind(offeringId).all<any>();
			allLessons = allBlocks.results || [];

			// Map lessonBlock → { id, title, slug, order_index, ... } for compat
			lessonBlock = {
				id: lessonBlock.id,
				title: lessonBlock.title,
				slug: lessonBlock.slug,
				order_index: lessonBlock.order_index,
				duration_minutes: lessonBlock.duration_min,
				is_optional: lessonBlock.is_optional,
				status: lessonBlock.visibility,
				content_block_id: lessonBlock.source_id,
				body: lessonBlock.body,
				body_html: lessonBlock.body_html,
				// Also keep raw for legacy access
				...lessonBlock
			};
		} else {
			// Legacy fallback: lessons table + junction
			const lesson = await db.prepare(
				'SELECT * FROM lessons WHERE slug = ? AND course_offering_id = ? AND status = ?'
			).bind(slug, offeringId, 'published').first<any>();

			if (!lesson) throw error(404, 'Lesson not found');

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

			const all = await db.prepare(
				'SELECT id, title, slug, order_index, duration_minutes FROM lessons WHERE course_offering_id = ? AND status = ? ORDER BY order_index ASC'
			).bind(offeringId, 'published').all();
			allLessons = all.results || [];

			lessonBlock = lesson;
		}

		return { lesson: lessonBlock, offering, course, contentBlocks, allLessons };
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		const msg = e instanceof Error ? e.message : 'Unknown error';
		throw error(500, 'Failed to load lesson: ' + msg);
	}
}

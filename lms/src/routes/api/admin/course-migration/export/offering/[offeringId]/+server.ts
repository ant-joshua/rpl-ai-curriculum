import { jsonResponse, getDB } from '$lib/server/d1';

const COURSE_TABLES = [
	'courses', 'course_offerings', 'lessons', 'content_blocks',
	'lesson_content_blocks', 'assessments', 'assignments',
	'question_bank', 'assessment_questions',
	'prerequisites', 'calendar_events',
];

/** POST /api/admin/course-migration/export/offering/<offeringId> — export a course offering + related data */
export async function POST({ params, platform, locals }: {
	params: { offeringId: string };
	platform: App.Platform;
	locals: any;
}): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';
		const offeringId = params.offeringId;

		if (!offeringId) {
			return jsonResponse({ success: false, error: 'offeringId diperlukan' }, 400);
		}

		// Verify offering belongs to this tenant
		const offering = await db
			.prepare('SELECT * FROM course_offerings WHERE id = ? AND tenant_id = ?')
			.bind(offeringId, tenantId)
			.first<any>();

		if (!offering) {
			return jsonResponse({ success: false, error: 'Course offering tidak ditemukan' }, 404);
		}

		const courseId = offering.course_id;

		// Export related data
		const exportData: Record<string, any[]> = {};

		// courses
		if (courseId) {
			const course = await db.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first<any>();
			if (course) exportData.courses = [course];
		}

		// course_offerings
		exportData.course_offerings = [offering];

		// lessons
		const { results: lessons } = await db
			.prepare('SELECT * FROM lessons WHERE course_offering_id = ? ORDER BY order_index')
			.bind(offeringId)
			.all() as any;
		if (lessons?.results?.length) exportData.lessons = lessons.results;
		const lessonIds = (lessons?.results || []).map((l: any) => l.id);

		// content_blocks linked via lesson_content_blocks
		if (lessonIds.length > 0) {
			const { results: lcb } = await db
				.prepare(`SELECT cb.* FROM content_blocks cb
					INNER JOIN lesson_content_blocks lcb ON cb.id = lcb.content_block_id
					WHERE lcb.lesson_id IN (${lessonIds.map(() => '?').join(',')})
					ORDER BY lcb.order_index`)
				.bind(...lessonIds)
				.all() as any;
			if (lcb?.results?.length) exportData.content_blocks = dedupeById(lcb.results);
		}

		// lesson_content_blocks
		if (lessonIds.length > 0) {
			const { results: lcbs } = await db
				.prepare(`SELECT * FROM lesson_content_blocks
					WHERE lesson_id IN (${lessonIds.map(() => '?').join(',')})
					ORDER BY order_index`)
				.bind(...lessonIds)
				.all() as any;
			if (lcbs?.results?.length) exportData.lesson_content_blocks = lcbs.results;
		}

		// content_blocks directly referenced by assessments/assignments (content_block_id)
		const { results: directCb } = await db
			.prepare(`SELECT DISTINCT cb.* FROM content_blocks cb
				INNER JOIN (
					SELECT content_block_id FROM assessments WHERE course_offering_id = ? AND content_block_id IS NOT NULL
					UNION
					SELECT content_block_id FROM assignments WHERE course_offering_id = ? AND content_block_id IS NOT NULL
				) ref ON cb.id = ref.content_block_id`)
			.bind(offeringId, offeringId)
			.all() as any;
		if (directCb?.results?.length) {
			const existing = new Set((exportData.content_blocks || []).map((c: any) => c.id));
			for (const cb of directCb.results) {
				if (!existing.has(cb.id)) {
					if (!exportData.content_blocks) exportData.content_blocks = [];
					exportData.content_blocks.push(cb);
				}
			}
		}

		// question_bank
		const { results: qb } = await db
			.prepare('SELECT * FROM question_bank WHERE course_offering_id = ?')
			.bind(offeringId)
			.all() as any;
		if (qb?.results?.length) exportData.question_bank = qb.results;
		const qbIds = (qb?.results || []).map((q: any) => q.id);

		// assessments
		const { results: assessments } = await db
			.prepare('SELECT * FROM assessments WHERE course_offering_id = ?')
			.bind(offeringId)
			.all() as any;
		if (assessments?.results?.length) exportData.assessments = assessments.results;

		// assessment_questions
		if (qbIds.length > 0) {
			const { results: aq } = await db
				.prepare(`SELECT aq.* FROM assessment_questions aq
					INNER JOIN assessments a ON aq.assessment_id = a.id
					WHERE a.course_offering_id = ?`)
				.bind(offeringId)
				.all() as any;
			if (aq?.results?.length) exportData.assessment_questions = aq.results;
		}

		// assignments
		const { results: assignments } = await db
			.prepare('SELECT * FROM assignments WHERE course_offering_id = ?')
			.bind(offeringId)
			.all() as any;
		if (assignments?.results?.length) exportData.assignments = assignments.results;

		// prerequisites
		if (lessonIds.length > 0) {
			const { results: prereqs } = await db
				.prepare(`SELECT * FROM prerequisites
					WHERE course_offering_id = ? AND
					(prerequisite_id IN (${lessonIds.map(() => '?').join(',')})
					 OR dependent_id IN (${lessonIds.map(() => '?').join(',')}))`)
				.bind(offeringId, ...lessonIds, ...lessonIds)
				.all() as any;
			if (prereqs?.results?.length) exportData.prerequisites = prereqs.results;
		}

		// calendar_events
		const { results: events } = await db
			.prepare('SELECT * FROM calendar_events WHERE course_offering_id = ?')
			.bind(offeringId)
			.all() as any;
		if (events?.results?.length) exportData.calendar_events = events.results;

		const payload = {
			exported_at: new Date().toISOString(),
			source_tenant_id: tenantId,
			offering_id: offeringId,
			version: 1,
			tables: exportData,
		};

		// Return as downloadable JSON
		const jsonStr = JSON.stringify(payload, null, 2);
		return new Response(jsonStr, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': `attachment; filename="course-${offeringId.substring(0, 8)}.json"`,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

function dedupeById(arr: any[]): any[] {
	const seen = new Set();
	return arr.filter((item) => {
		if (seen.has(item.id)) return false;
		seen.add(item.id);
		return true;
	});
}

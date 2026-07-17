import { jsonResponse, getDB } from '$lib/server/d1';

const COURSE_TABLES = [
	'courses', 'course_offerings', 'lessons', 'content_blocks',
	'lesson_content_blocks', 'assessments', 'assignments',
	'question_bank', 'assessment_questions',
	'prerequisites', 'calendar_events',
];

/** GET /api/admin/course-migration/offerings — list offerings available for export */
export async function GET({ platform, locals }: { platform: App.Platform; locals: any }): Promise<Response> {
	try {
		const db = getDB(platform);
		const tenantId = locals.tenant?.id || 'default';

		const { results: offerings } = await db
			.prepare(
				`SELECT co.id, co.name, co.code, co.status, co.course_id,
				        c.title AS course_title, c.slug AS course_slug,
				        u.display_name AS instructor_name
				 FROM course_offerings co
				 LEFT JOIN courses c ON co.course_id = c.id
				 LEFT JOIN users u ON co.instructor_id = u.id
				 WHERE co.tenant_id = ?
				 ORDER BY co.created_at DESC`
			)
			.bind(tenantId)
			.all() as any;

		return jsonResponse({ success: true, data: offerings?.results || [] });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

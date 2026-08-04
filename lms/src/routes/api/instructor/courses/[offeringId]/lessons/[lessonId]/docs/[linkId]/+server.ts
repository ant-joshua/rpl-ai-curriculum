import { getDB, jsonResponse } from '$lib/server/d1';
import { cachedDbFirst } from '$lib/server/cache';

// DELETE /api/instructor/courses/[offeringId]/lessons/[lessonId]/docs/[linkId]
export async function DELETE({ params, platform, locals }: { params: { offeringId: string; lessonId: string; linkId: string }; platform: App.Platform; locals: Record<string, any> }): Promise<Response> {
	try {
		const db = getDB(platform);
		const user = locals.user;
		if (!user) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const offering = await cachedDbFirst<any>(db, 'SELECT * FROM course_offerings WHERE id = ?', [params.offeringId]);
		if (!offering) return jsonResponse({ success: false, error: 'Course not found' }, 404);
		if (user.role !== 'superadmin' && user.role !== 'admin' && offering.instructor_id !== user.id) {
			return jsonResponse({ success: false, error: 'Forbidden' }, 403);
		}

		const link = await db.prepare(
			'SELECT * FROM lesson_aiedu_docs WHERE id = ? AND lesson_id = ?'
		).bind(params.linkId, params.lessonId).first<any>();
		if (!link) return jsonResponse({ success: false, error: 'Link not found' }, 404);

		await db.prepare('DELETE FROM lesson_aiedu_docs WHERE id = ?').bind(params.linkId).run();
		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

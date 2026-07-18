import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { cachedDbQuery } from '$lib/server/cache';

export async function GET({ params, request, platform }: {
	params: { offeringId: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const userId = session.user.id;
		const db = getDB(platform);
		const offeringId = params.offeringId;

		// Get all lessons for this offering
		const { results: lessons } = await cachedDbQuery<any>(
			db,
			`SELECT id, title, slug, order_index, duration_minutes, is_optional
			 FROM lessons
			 WHERE course_offering_id = ? AND status = 'published'
			 ORDER BY order_index ASC`,
			[offeringId]
		);

		// Get lesson completions
		const { results: completions } = await cachedDbQuery<any>(
			db,
			`SELECT lc.* FROM lesson_completions lc
			 JOIN lessons l ON l.id = lc.lesson_id
			 WHERE lc.user_id = ? AND l.course_offering_id = ?`,
			[userId, offeringId]
		);

		// Get progress table as fallback
		const { results: progressRows } = await cachedDbQuery<any>(
			db,
			`SELECT session_id, completed, completed_at, time_spent
			 FROM progress
			 WHERE user_id = ? AND module_slug = ? AND completed = 1`,
			[userId, offeringId]
		);

		const completedLessonIds = new Set(completions?.map(c => c.lesson_id) || []);
		const completedSlugs = new Set(progressRows?.map(p => p.session_id) || []);

		const lessonProgress = (lessons || []).map(l => {
			const isCompleted = completedLessonIds.has(l.id) || completedSlugs.has(l.slug);
			const comp = completions?.find(c => c.lesson_id === l.id);
			return {
				lessonId: l.id,
				title: l.title,
				slug: l.slug,
				orderIndex: l.order_index,
				durationMinutes: l.duration_minutes,
				isOptional: !!l.is_optional,
				completed: isCompleted,
				completedAt: comp?.completed_at || null,
				timeSpentSeconds: comp?.time_spent_seconds || 0,
			};
		});

		const total = lessonProgress.length;
		const completed = lessonProgress.filter(l => l.completed).length;
		const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

		return jsonResponse({
			success: true,
			data: {
				offeringId,
				lessons: lessonProgress,
				summary: { total, completed, percentage },
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

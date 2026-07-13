import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ params, request, platform }: {
	params: { id: string };
	request: Request;
	platform: App.Platform;
}): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);

		// 1. Fetch the lesson
		const lesson = await db
			.prepare('SELECT * FROM lessons WHERE id = ?')
			.bind(params.id)
			.first<any>();

		if (!lesson) {
			return jsonResponse({ success: false, error: 'Lesson not found' }, 404);
		}

		// 2. Get course offering for date-based checks
		const offering = await db
			.prepare('SELECT * FROM course_offerings WHERE id = ?')
			.bind(lesson.course_offering_id)
			.first<any>();

		// 3. Check unlock_days (time-based gating)
		if (lesson.unlock_days != null && lesson.unlock_days > 0 && offering?.start_date) {
			const offeringStart = new Date(offering.start_date);
			const unlockDate = new Date(offeringStart);
			unlockDate.setDate(unlockDate.getDate() + lesson.unlock_days);
			const now = new Date();

			if (now < unlockDate) {
				return jsonResponse({
					success: true,
					data: {
						accessible: false,
						reason: 'This lesson will be unlocked on ' + unlockDate.toLocaleDateString(),
						unlock_date: unlockDate.toISOString(),
						lesson_id: params.id,
						lesson_title: lesson.title
					},
				});
			}
		}

		// 4. Fetch all prerequisites where dependent_id = this lesson
		const prerequisites = await db
			.prepare(
				`SELECT p.prerequisite_id AS lesson_id, l.title, l.slug
				 FROM prerequisites p
				 JOIN lessons l ON l.id = p.prerequisite_id
				 WHERE p.dependent_id = ?`
			)
			.bind(params.id)
			.all();

		const prereqList = prerequisites.results || [];

		// No prerequisites → immediately accessible
		if (prereqList.length === 0) {
			return jsonResponse({
				success: true,
				data: {
					accessible: true,
					lesson_id: params.id,
					lesson_title: lesson.title,
					prerequisites: [],
				},
			});
		}

		// 5. Check completion for each prerequisite
		const results = [];
		let allComplete = true;

		for (const prereq of prereqList) {
			const progress = await db
				.prepare(
					"SELECT id FROM progress WHERE module_slug = ? AND user_id = ? AND completed = 1"
				)
				.bind(prereq.slug, session.session.user_id)
				.first<any>();

			const completed = progress !== null;
			if (!completed) allComplete = false;

			results.push({
				lesson_id: prereq.lesson_id,
				title: prereq.title,
				completed,
			});
		}

		return jsonResponse({
			success: true,
			data: {
				accessible: allComplete,
				lesson_id: params.id,
				lesson_title: lesson.title,
				prerequisites: results,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

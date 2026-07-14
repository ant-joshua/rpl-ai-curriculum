import { getDB, jsonResponse } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);
		const userName = session.user.name || session.user.email?.split('@')[0] || 'Student';

		// --- Current streak: count consecutive days with activity ---
		const today = new Date().toISOString().slice(0, 10);
		const { results: activityDays } = await db.prepare(
			`SELECT DISTINCT DATE(created_at) as day
			 FROM user_activity_log
			 WHERE user_id = ? AND created_at >= DATE('now', '-60 days')
			 ORDER BY day DESC`
		).bind(userId).all<{ day: string }>();

		let currentStreak = 0;
		if (activityDays && activityDays.length > 0) {
			const checkDate = new Date(today);
			for (const row of activityDays) {
				const rowDate = new Date(row.day + 'T00:00:00Z');
				const diff = Math.round((checkDate.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24));
				if (diff === currentStreak) {
					currentStreak++;
				} else if (diff > currentStreak) {
					break;
				}
			}
		}

		// --- Enrollments with course + progress ---
		const { results: enrollments } = await db.prepare(
			`SELECT e.id AS enrollment_id, e.course_offering_id, e.status AS enrollment_status,
			        co.id AS offering_id, co.name AS offering_name, co.code AS offering_code,
			        c.id AS course_id, c.title AS course_title, c.slug AS course_slug, c.icon AS course_icon,
			        c.description AS course_description
			 FROM enrollments e
			 JOIN course_offerings co ON co.id = e.course_offering_id
			 JOIN courses c ON c.id = co.course_id
			 WHERE e.user_id = ?
			 ORDER BY e.enrolled_at DESC`
		).bind(userId).all<any>();

		// --- Lessons lookup for last lesson per offering ---
		const { results: allLessons } = await db.prepare(
			`SELECT id, title, slug, course_offering_id
			 FROM lessons
			 WHERE status = 'published'
			 ORDER BY order_index ASC`
		).all<any>();

		const lessonsByOffering = new Map<string, any[]>();
		for (const lesson of (allLessons || [])) {
			const list = lessonsByOffering.get(lesson.course_offering_id) || [];
			list.push(lesson);
			lessonsByOffering.set(lesson.course_offering_id, list);
		}

		// --- Progress data for this user ---
		const { results: progressRows } = await db.prepare(
			`SELECT p.*, l.title AS lesson_title, l.course_offering_id
			 FROM progress p
			 JOIN lessons l ON l.slug = p.session_id
			 WHERE p.user_id = ? AND p.completed = 1
			 ORDER BY p.updated_at DESC`
		).bind(userId).all<any>();

		// Map: offeringId -> progress info
		const progressByOffering = new Map<string, { completed: number; total: number; lastLessonTitle: string | null; nextLessonSlug: string | null; pct: number }>();

		for (const enrollment of (enrollments || [])) {
			const offeringId = enrollment.course_offering_id;
			const offeringLessons = lessonsByOffering.get(offeringId) || [];
			const totalLessons = offeringLessons.length;

			const completedForOffering = (progressRows || []).filter(
				p => p.course_offering_id === offeringId
			);
			const completedCount = completedForOffering.length;

			// Last completed lesson
			const lastCompleted = completedForOffering.length > 0
				? completedForOffering[0].lesson_title || null
				: null;

			// Find first uncompleted lesson slug
			const completedSlugs = new Set(completedForOffering.map(p => p.session_id));
			let nextSlug: string | null = null;
			for (const lesson of offeringLessons) {
				if (!completedSlugs.has(lesson.slug)) {
					nextSlug = lesson.slug;
					break;
				}
			}
			// If all completed, last lesson is the next (for "review")
			if (!nextSlug && offeringLessons.length > 0) {
				nextSlug = offeringLessons[offeringLessons.length - 1].slug;
			}

			const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
			progressByOffering.set(offeringId, {
				completed: completedCount,
				total: totalLessons,
				lastLessonTitle: lastCompleted,
				nextLessonSlug: nextSlug,
				pct
			});
		}

		// --- Build active courses ---
		const activeCourses: any[] = [];
		let totalProgressSum = 0;
		let enrollmentCount = 0;

		for (const enrollment of (enrollments || [])) {
			const offeringId = enrollment.course_offering_id;
			const prog = progressByOffering.get(offeringId) || { completed: 0, total: 0, lastLessonTitle: null, nextLessonSlug: null, pct: 0 };

			if (prog.pct > 0) {
				totalProgressSum += prog.pct;
				enrollmentCount++;
			}

			activeCourses.push({
				offeringId: enrollment.offering_id,
				courseTitle: enrollment.course_title,
				courseIcon: enrollment.course_icon || '📚',
				progress: prog.pct,
				lastLessonTitle: prog.lastLessonTitle,
				nextLessonSlug: prog.nextLessonSlug,
				totalLessons: prog.total,
				completedLessons: prog.completed,
			});
		}

		const averageProgress = enrollmentCount > 0 ? Math.round(totalProgressSum / enrollmentCount) : 0;

		// --- Recent activity ---
		const { results: recentActivity } = await db.prepare(
			`SELECT action, entity_type, entity_id, metadata, created_at
			 FROM user_activity_log
			 WHERE user_id = ?
			 ORDER BY created_at DESC
			 LIMIT 5`
		).bind(userId).all<any>();

		// --- Upcoming deadlines (assessments/assignments with due_date) ---
		const { results: upcomingDeadlines } = await db.prepare(
			`SELECT a.id, a.title, a.due_date, a.type AS type, 'assessment' AS kind,
			        co.id AS offering_id, co.name AS offering_name
			 FROM assessments a
			 JOIN course_offerings co ON co.id = a.course_offering_id
			 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
			 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
			 UNION ALL
			 SELECT a.id, a.title, a.due_date, a.submission_type AS type, 'assignment' AS kind,
			        co.id AS offering_id, co.name AS offering_name
			 FROM assignments a
			 JOIN course_offerings co ON co.id = a.course_offering_id
			 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
			 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
			 ORDER BY due_date ASC
			 LIMIT 10`
		).bind(userId, userId).all<any>();

		return jsonResponse({
			success: true,
			data: {
				userName,
				currentStreak,
				averageProgress,
				activeCourses,
				upcomingDeadlines: upcomingDeadlines || [],
				recentActivity: (recentActivity || []).map(a => ({
					action: a.action,
					entityType: a.entity_type,
					entityId: a.entity_id,
					metadata: a.metadata ? (() => { try { return JSON.parse(a.metadata); } catch { return a.metadata; } })() : null,
					createdAt: a.created_at,
				})),
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

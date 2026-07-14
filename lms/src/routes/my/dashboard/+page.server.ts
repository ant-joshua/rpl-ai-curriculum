import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	// Get token from cookie or Authorization header
	const token = getBearerToken(request) || url.searchParams.get('token');

	if (!token) {
		throw redirect(302, '/login?redirect=/my/dashboard');
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, '/login?redirect=/my/dashboard');
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

	// --- Enrollments with course info ---
	const { results: enrollments } = await db.prepare(
		`SELECT e.course_offering_id, e.status AS enrollment_status,
		        co.id AS offering_id, co.name AS offering_name,
		        c.id AS course_id, c.title AS course_title, c.slug AS course_slug, c.icon AS course_icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ?
		 ORDER BY e.enrolled_at DESC`
	).bind(userId).all<any>();

	const offeringIds = (enrollments || []).map(e => e.course_offering_id);

	// --- All published lessons for user's offerings ---
	let lessonsByOffering = new Map<string, any[]>();
	if (offeringIds.length > 0) {
		const placeholders = offeringIds.map(() => '?').join(',');
		const { results: lessons } = await db.prepare(
			`SELECT id, title, slug, course_offering_id
			 FROM lessons
			 WHERE course_offering_id IN (${placeholders}) AND status = 'published'
			 ORDER BY order_index ASC`
		).bind(...offeringIds).all<any>();

		for (const lesson of (lessons || [])) {
			const list = lessonsByOffering.get(lesson.course_offering_id) || [];
			list.push(lesson);
			lessonsByOffering.set(lesson.course_offering_id, list);
		}
	}

	// --- Progress for this user ---
	const { results: progressRows } = await db.prepare(
		`SELECT p.session_id, p.completed, l.course_offering_id, l.title AS lesson_title
		 FROM progress p
		 JOIN lessons l ON l.slug = p.session_id
		 WHERE p.user_id = ? AND p.completed = 1`
	).bind(userId).all<any>();

	const completedMap = new Map<string, Set<string>>();
	const lastLessonByOffering = new Map<string, { title: string; slug: string }>();
	for (const row of (progressRows || [])) {
		const offId = row.course_offering_id;
		if (!completedMap.has(offId)) completedMap.set(offId, new Set());
		completedMap.get(offId)!.add(row.session_id);
		lastLessonByOffering.set(offId, { title: row.lesson_title, slug: row.session_id });
	}

	// --- Build active courses ---
	const activeCourses: any[] = [];
	let totalProgressSum = 0;
	let enrollmentCount = 0;

	for (const enrollment of (enrollments || [])) {
		const offId = enrollment.course_offering_id;
		const offeringLessons = lessonsByOffering.get(offId) || [];
		const completedSet = completedMap.get(offId) || new Set();
		const total = offeringLessons.length;
		const completed = [...completedSet].filter(s => offeringLessons.some(l => l.slug === s)).length;
		const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

		if (pct > 0 || enrollment.enrollment_status === 'active') {
			totalProgressSum += pct;
			enrollmentCount++;
		}

		// Next lesson slug
		let nextSlug: string | null = null;
		for (const lesson of offeringLessons) {
			if (!completedSet.has(lesson.slug)) {
				nextSlug = lesson.slug;
				break;
			}
		}
		if (!nextSlug && offeringLessons.length > 0) {
			nextSlug = offeringLessons[offeringLessons.length - 1].slug;
		}

		activeCourses.push({
			offeringId: enrollment.offering_id,
			courseTitle: enrollment.course_title,
			courseIcon: enrollment.course_icon || '📚',
			progress: pct,
			lastLessonTitle: lastLessonByOffering.get(offId)?.title || null,
			nextLessonSlug: nextSlug,
			totalLessons: total,
			completedLessons: completed,
		});
	}

	const averageProgress = enrollmentCount > 0 ? Math.round(totalProgressSum / enrollmentCount) : 0;

	return {
		userName,
		currentStreak,
		averageProgress,
		activeCourses,
		token,
	};
};

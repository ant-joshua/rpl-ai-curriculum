import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

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

	// Fetch user display info
	const user = await db.prepare(
		`SELECT display_name, avatar_url
		 FROM users WHERE id = ?`
	).bind(userId).first<any>();

	const displayName = user?.display_name || session.user.name || session.user.email?.split('@')[0] || 'Siswa';
	const avatarUrl = user?.avatar_url || '';

	// --- Current streak ---
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

	// --- Upcoming deadlines (assessments + assignments with due_date) ---
	const { results: upcomingDeadlines } = await db.prepare(
		`SELECT a.id, a.title, a.due_date, a.type AS type, 'assessment' AS kind,
		        co.id AS offering_id, co.name AS offering_name
		 FROM assessments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
		 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
		   AND a.status = 'published'
		 UNION ALL
		 SELECT a.id, a.title, a.due_date, a.submission_type AS type, 'assignment' AS kind,
		        co.id AS offering_id, co.name AS offering_name
		 FROM assignments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
		 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
		   AND a.status = 'published'
		 ORDER BY due_date ASC
		 LIMIT 10`
	).bind(userId, userId).all<any>();

	// --- Recent activity (last 5) ---
	const { results: recentActivity } = await db.prepare(
		`SELECT action, entity_type, entity_id, metadata, created_at
		 FROM user_activity_log
		 WHERE user_id = ?
		 ORDER BY created_at DESC
		 LIMIT 5`
	).bind(userId).all<any>();

	return {
		displayName,
		avatarUrl,
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
		token,
	};
};

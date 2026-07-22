import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession, getTokenFromRequest } from '$lib/server/auth';
import { cachedDbQuery, cachedDbFirst } from '$lib/server/cache';

export async function load({ request, platform, url }) {
	const token = getTokenFromRequest(request);
	if (!token || !platform) {
		return {
			enrollments: [],
			activeCourses: [],
			completedCount: 0,
			totalEnrollments: 0,
			averageProgress: 0,
			gamification: null,
			upcomingDeadlines: [],
			recentActivity: [],
		};
	}

	const session = await getSession(platform, token);
	if (!session) {
		return {
			enrollments: [],
			activeCourses: [],
			completedCount: 0,
			totalEnrollments: 0,
			averageProgress: 0,
			gamification: null,
			upcomingDeadlines: [],
			recentActivity: [],
		};
	}

	const db = getDB(platform);
	const userId = session.user.id;

	// ─── Gamification stats ───
	const xpRow = await cachedDbFirst<any>(db, 'SELECT * FROM user_xp WHERE user_id = ?', [userId]);
	const streakRow = await cachedDbFirst<any>(db, 'SELECT * FROM user_streaks WHERE user_id = ?', [userId]);

	const totalXp = xpRow?.total_xp ?? 0;
	const level = xpRow?.level ?? 1;
	const currentLevelXp = (level - 1) * 100;
	const xpToNext = level * 100 - totalXp;

	const gamification = {
		totalXp,
		level,
		currentLevelXp,
		xpToNext,
		streak: {
			current: streakRow?.current_streak ?? 0,
			longest: streakRow?.longest_streak ?? 0,
			lastActivityDate: streakRow?.last_activity_date ?? null,
		},
	};

	// ─── Enrollments with progress ───
	const { results: enrollments } = await cachedDbQuery<any>(
		db,
		`SELECT e.id AS enrollment_id, e.course_offering_id, e.status AS enrollment_status,
		        co.id AS offering_id, co.name AS offering_name, co.code AS offering_code,
		        c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
		        c.icon AS course_icon, c.description AS course_description
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ?
		 ORDER BY e.enrolled_at DESC`,
		[userId]
	);

	// ─── All published lessons for progress calc ───
	const { results: allLessons } = await cachedDbQuery<any>(
		db,
		`SELECT id, title, slug, course_offering_id
		 FROM lessons
		 WHERE status = 'published'
		 ORDER BY order_index ASC`
	);

	const lessonsByOffering = new Map<string, any[]>();
	for (const lesson of (allLessons || [])) {
		const list = lessonsByOffering.get(lesson.course_offering_id) || [];
		list.push(lesson);
		lessonsByOffering.set(lesson.course_offering_id, list);
	}

	// ─── Progress data ───
	const { results: progressRows } = await cachedDbQuery<any>(
		db,
		`SELECT p.*, l.title AS lesson_title, l.course_offering_id
		 FROM progress p
		 JOIN lessons l ON l.slug = p.session_id
		 WHERE p.user_id = ? AND p.completed = 1
		 ORDER BY p.updated_at DESC`,
		[userId]
	);

	const progressByOffering = new Map<string, { completed: number; total: number; lastLessonTitle: string | null; nextLessonSlug: string | null; pct: number }>();
	const completedPerOffering = new Map<string, string[]>();

	for (const row of (progressRows || [])) {
		const list = completedPerOffering.get(row.course_offering_id) || [];
		list.push(row.session_id);
		completedPerOffering.set(row.course_offering_id, list);
	}

	const activeCourses: any[] = [];
	let totalProgressSum = 0;
	let nonZeroCount = 0;
	let completedCount = 0;

	for (const enrollment of (enrollments || [])) {
		const offeringId = enrollment.course_offering_id;
		const offeringLessons = lessonsByOffering.get(offeringId) || [];
		const totalLessons = offeringLessons.length;
		const completedSessions = completedPerOffering.get(offeringId) || [];
		const completedCount2 = completedSessions.length;

		const lastCompleted = (progressRows || []).find(p => p.course_offering_id === offeringId);
		const completedSlugs = new Set(completedSessions);
		let nextSlug: string | null = null;
		for (const lesson of offeringLessons) {
			if (!completedSlugs.has(lesson.slug)) {
				nextSlug = lesson.slug;
				break;
			}
		}
		if (!nextSlug && offeringLessons.length > 0) {
			nextSlug = offeringLessons[offeringLessons.length - 1].slug;
		}

		const pct = totalLessons > 0 ? Math.round((completedCount2 / totalLessons) * 100) : 0;

		if (pct > 0) {
			totalProgressSum += pct;
			nonZeroCount++;
		}
		if (pct === 100) completedCount++;

		activeCourses.push({
			offeringId: enrollment.offering_id,
			courseTitle: enrollment.course_title,
			courseSlug: enrollment.course_slug,
			courseIcon: enrollment.course_icon || '📚',
			courseDescription: enrollment.course_description,
			progress: pct,
			lastLessonTitle: lastCompleted?.lesson_title ?? null,
			nextLessonSlug: nextSlug,
			totalLessons,
			completedLessons: completedCount2,
		});
	}

	const averageProgress = nonZeroCount > 0 ? Math.round(totalProgressSum / nonZeroCount) : 0;

	// ─── Upcoming deadlines ───
	const { results: upcomingDeadlines } = await cachedDbQuery<any>(
		db,
		`SELECT a.id, a.title, a.due_date, a.type AS assessment_type, 'assessment' AS kind,
		        co.id AS offering_id, co.name AS offering_name
		 FROM assessments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
		 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
		 UNION ALL
		 SELECT a.id, a.title, a.due_date, a.submission_type AS assessment_type, 'assignment' AS kind,
		        co.id AS offering_id, co.name AS offering_name
		 FROM assignments a
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
		 WHERE a.due_date IS NOT NULL AND a.due_date >= DATE('now')
		 ORDER BY due_date ASC
		 LIMIT 10`,
		[userId, userId]
	);

	// ─── Recent activity ───
	const { results: recentActivity } = await cachedDbQuery<any>(
		db,
		`SELECT af.*, u.display_name, u.avatar_url, co.name as offering_name
		 FROM activity_feed af
		 LEFT JOIN users u ON u.id = af.user_id
		 LEFT JOIN course_offerings co ON co.id = af.offering_id
		 WHERE af.user_id = ?
		 ORDER BY af.created_at DESC
		 LIMIT 10`,
		[userId]
	);

	const parsedActivity = (recentActivity || []).map((r: any) => ({
		...r,
		metadata: r.metadata ? (() => { try { return JSON.parse(r.metadata); } catch { return r.metadata; } })() : null,
	}));

	return {
		userName: session.user.name || session.user.email?.split('@')[0] || 'Student',
		enrollments: enrollments || [],
		activeCourses,
		completedCount,
		totalEnrollments: (enrollments || []).length,
		averageProgress,
		gamification,
		upcomingDeadlines: (upcomingDeadlines || []),
		recentActivity: parsedActivity,
	};
}

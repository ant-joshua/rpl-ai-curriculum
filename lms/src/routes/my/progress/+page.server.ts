import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) throw redirect(302, '/?error=no-platform');

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) throw redirect(302, '/login?redirect=/my/progress');

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/login?redirect=/my/progress');

	const userId = session.user.id;
	const db = getDB(platform);

	// --- Overall progress summary ---
	const { results: enrollments } = await db.prepare(
		`SELECT e.course_offering_id, e.status, e.enrolled_at, e.completed_at,
		        co.id AS offering_id, co.name AS offering_name,
		        c.id AS course_id, c.title AS course_title, c.icon AS course_icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ?
		 ORDER BY e.enrolled_at DESC`
	).bind(userId).all<any>();

	const offeringIds = (enrollments || []).map(e => e.course_offering_id);
	const enrollmentCount = (enrollments || []).length;
	const completedCourseCount = (enrollments || []).filter(e => e.status === 'completed').length;

	// --- Lessons per offering ---
	const lessonsByOffering = new Map<string, any[]>();
	if (offeringIds.length > 0) {
		const placeholders = offeringIds.map(() => '?').join(',');
		const { results: lessons } = await db.prepare(
			`SELECT id, title, slug, course_offering_id
			 FROM lessons
			 WHERE course_offering_id IN (${placeholders}) AND status = 'published'
			 ORDER BY order_index ASC`
		).bind(...offeringIds).all<any>();
		for (const l of (lessons || [])) {
			const list = lessonsByOffering.get(l.course_offering_id) || [];
			list.push(l);
			lessonsByOffering.set(l.course_offering_id, list);
		}
	}

	// --- Progress ---
	const { results: progressRows } = await db.prepare(
		`SELECT p.session_id, p.completed, p.completed_at, p.score,
		        l.course_offering_id, l.title AS lesson_title
		 FROM progress p
		 JOIN lessons l ON l.slug = p.session_id
		 WHERE p.user_id = ? AND p.completed = 1`
	).bind(userId).all<any>();

	const completedMap = new Map<string, Set<string>>();
	for (const row of (progressRows || [])) {
		if (!completedMap.has(row.course_offering_id)) completedMap.set(row.course_offering_id, new Set());
		completedMap.get(row.course_offering_id)!.add(row.session_id);
	}

	// --- Per-course progress ---
	const courseProgress: any[] = [];
	let totalPct = 0;
	let courseWithProgress = 0;

	for (const enrollment of (enrollments || [])) {
		const offId = enrollment.course_offering_id;
		const offeringLessons = lessonsByOffering.get(offId) || [];
		const completedSet = completedMap.get(offId) || new Set();
		const total = offeringLessons.length;
		const completed = [...completedSet].filter(s => offeringLessons.some(l => l.slug === s)).length;
		const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

		if (pct > 0 || enrollment.status === 'active') {
			totalPct += pct;
			courseWithProgress++;
		}

		courseProgress.push({
			offeringId: offId,
			courseTitle: enrollment.course_title,
			courseIcon: enrollment.course_icon || '📚',
			progress: pct,
			totalLessons: total,
			completedLessons: completed,
			status: enrollment.status,
			enrolledAt: enrollment.enrolled_at,
		});
	}

	const avgProgress = courseWithProgress > 0 ? Math.round(totalPct / courseWithProgress) : 0;

	// --- Average score from graded submissions ---
	const { results: scoreRows } = await db.prepare(
		`SELECT score, max_score FROM assessment_submissions
		 WHERE user_id = ? AND score IS NOT NULL AND status = 'graded'`
	).bind(userId).all<any>();

	let totalScorePct = 0;
	let scoreCount = 0;
	for (const r of (scoreRows || [])) {
		if (r.max_score > 0) {
			totalScorePct += (r.score / r.max_score) * 100;
			scoreCount++;
		}
	}
	const avgScore = scoreCount > 0 ? Math.round(totalScorePct / scoreCount) : 0;

	// --- Attendance rate ---
	const { results: attSessions } = await db.prepare(
		`SELECT COUNT(*) as total FROM attendance_sessions
		 WHERE course_offering_id IN (SELECT course_offering_id FROM enrollments WHERE user_id = ?)`
	).bind(userId).all<any>();
	const { results: attCheckins } = await db.prepare(
		`SELECT COUNT(*) as total FROM attendance_records
		 WHERE user_id = ? AND status = 'present'`
	).bind(userId).all<any>();

	const totalAttSessions = attSessions?.[0]?.total || 0;
	const totalAttCheckins = attCheckins?.[0]?.total || 0;
	const attendanceRate = totalAttSessions > 0 ? Math.round((totalAttCheckins / totalAttSessions) * 100) : 0;

	// --- Grade trend (assessments over time) ---
	const { results: gradeTrend } = await db.prepare(
		`SELECT asub.score, asub.max_score, asub.submitted_at, a.title AS assessment_title
		 FROM assessment_submissions asub
		 JOIN assessments a ON a.id = asub.assessment_id
		 WHERE asub.user_id = ? AND asub.score IS NOT NULL AND asub.status = 'graded'
		 ORDER BY asub.submitted_at ASC`
	).bind(userId).all<any>();

	const gradeTrendData = (gradeTrend || []).map(r => ({
		title: r.assessment_title,
		score: r.max_score > 0 ? Math.round((r.score / r.max_score) * 100) : 0,
		date: r.submitted_at?.slice(0, 10) || '',
	}));

	// --- Recent activity ---
	const { results: recentActivity } = await db.prepare(
		`SELECT action, entity_type, entity_id, metadata, created_at
		 FROM user_activity_log
		 WHERE user_id = ?
		 ORDER BY created_at DESC
		 LIMIT 20`
	).bind(userId).all<any>();

	// --- XP & Level from gamification ---
	const { results: xpRows } = await db.prepare(
		`SELECT total_xp, level FROM user_xp WHERE user_id = ?`
	).bind(userId).all<any>();
	const totalXp = xpRows?.[0]?.total_xp || 0;
	const level = xpRows?.[0]?.level || Math.max(1, Math.floor(totalXp / 100) + 1);
	const xpPerLevel = 100;
	const currentLevelXp = (level - 1) * xpPerLevel;
	const xpInLevel = totalXp - currentLevelXp;
	const xpForNextLevel = level * xpPerLevel;
	const xpToNext = xpForNextLevel - totalXp;

	// Badges count
	const { results: badgeRows } = await db.prepare(
		`SELECT COUNT(*) as total FROM user_badges WHERE user_id = ?`
	).bind(userId).all<any>();
	const badgeCount = badgeRows?.[0]?.total || 0;

	return {
		avgProgress,
		avgScore,
		attendanceRate,
		courseProgress,
		enrollmentCount,
		completedCourseCount,
		gradeTrendData,
		recentActivity: (recentActivity || []).map(a => ({
			action: a.action,
			entityType: a.entity_type,
			entityId: a.entity_id,
			metadata: a.metadata ? (() => { try { return JSON.parse(a.metadata); } catch { return a.metadata; } })() : null,
			createdAt: a.created_at,
		})),
		xp: { totalXp, level, currentLevelXp, xpInLevel, xpForNextLevel, xpToNext },
		badgeCount,
		token,
	};
};

import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/** POST /api/gamification/claim-badge — claim a badge when criteria met */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body: { badgeId: string } = await request.json();

		if (!body.badgeId) {
			return jsonResponse({ success: false, error: 'badgeId is required' }, 400);
		}

		// Check badge exists
		const badge = await db.prepare('SELECT * FROM badges WHERE id = ?').bind(body.badgeId).first<any>();
		if (!badge) {
			return jsonResponse({ success: false, error: 'Badge not found' }, 404);
		}

		// Check already claimed
		const existing = await db.prepare(
			'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?'
		).bind(userId, body.badgeId).first<any>();
		if (existing) {
			return jsonResponse({ success: false, error: 'Badge already claimed' }, 409);
		}

		// Check user stats for criteria
		const xpRow = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
		const streakRow = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();
		const currentStreak = streakRow?.current_streak ?? 0;
		const totalXp = xpRow?.total_xp ?? 0;

		const lessonCount = await db.prepare(
			"SELECT COUNT(*) as c FROM user_lesson_progress WHERE user_id = ? AND completed = 1"
		).bind(userId).first<{ c: number }>();
		const completedLessons = lessonCount?.c ?? 0;

		const assessmentCount = await db.prepare(
			"SELECT COUNT(*) as c FROM assessment_submissions WHERE user_id = ? AND status = 'graded'"
		).bind(userId).first<{ c: number }>();
		const completedAssessments = assessmentCount?.c ?? 0;

		const courseCount = await db.prepare(
			"SELECT COUNT(*) as c FROM enrollments WHERE user_id = ? AND status = 'completed'"
		).bind(userId).first<{ c: number }>();
		const completedCourses = courseCount?.c ?? 0;

		const criteriaVal = badge.criteria_value ?? 1;
		let earned = false;

		switch (badge.criteria_type) {
			case 'lessons_completed':
				earned = completedLessons >= criteriaVal;
				break;
			case 'assessments_passed':
				earned = completedAssessments >= criteriaVal;
				break;
			case 'streak_days':
				earned = currentStreak >= criteriaVal;
				break;
			case 'courses_completed':
				earned = completedCourses >= criteriaVal;
				break;
			case 'discussion_posts':
				const postCount = await db.prepare(
					"SELECT COUNT(*) as c FROM discussion_replies WHERE user_id = ?"
				).bind(userId).first<{ c: number }>();
				earned = (postCount?.c ?? 0) >= criteriaVal;
				break;
			case 'custom':
				earned = totalXp >= criteriaVal;
				break;
		}

		if (!earned) {
			return jsonResponse({ success: false, error: 'Belum memenuhi kriteria badge ini' }, 400);
		}

		// Award badge
		const id = crypto.randomUUID();
		await db.prepare(
			'INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES (?, ?, ?, datetime(\'now\'))'
		).bind(id, userId, body.badgeId).run();

		// Award XP reward if badge has one
		let xpAwarded = 0;
		if (badge.xp_reward && badge.xp_reward > 0) {
			xpAwarded = badge.xp_reward;
			await db.prepare(
				"UPDATE user_xp SET total_xp = total_xp + ?, updated_at = datetime('now') WHERE user_id = ?"
			).bind(badge.xp_reward, userId).run();
		}

		return jsonResponse({
			success: true,
			data: {
				badgeId: badge.id,
				badgeName: badge.name,
				badgeIcon: badge.icon,
				xpAwarded,
			}
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

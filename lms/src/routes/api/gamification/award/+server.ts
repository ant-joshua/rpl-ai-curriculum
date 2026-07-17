import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

const STREAK_MILESTONES: { days: number; xp: number }[] = [
	{ days: 3, xp: 20 },
	{ days: 7, xp: 50 },
	{ days: 30, xp: 200 },
];

const DEFAULT_XP_REASONS: Record<string, number> = {
	lesson_complete: 10,
	daily_login: 5,
	assignment_graded: 25,
	assessment_completed: 20,
	discussion_post: 5,
	streak_milestone: 20,
};

/**
 * Get XP amount for an action, checking configurable rules first.
 */
async function getXpAmount(db: any, reason: string, fallback: number): Promise<number> {
	try {
		const rule = await db.prepare(
			'SELECT xp_amount FROM xp_rules WHERE action_type = ? AND is_active = 1'
		).bind(reason).first<{ xp_amount: number }>();
		if (rule) return rule.xp_amount;
	} catch { /* use fallback */ }
	return fallback;
}

/**
 * Check and award badge if criteria met. Returns newly unlocked badge IDs.
 */
async function checkBadgeUnlocks(
	db: any,
	userId: string,
	totalXp: number,
	level: number
): Promise<{ badgeId: string; badgeName: string; badgeIcon: string; xpReward: number }[]> {
	const unlocked: { badgeId: string; badgeName: string; badgeIcon: string; xpReward: number }[] = [];

	// Get all badges
	const { results: badges } = await db.prepare('SELECT * FROM badges').all<any>();
	if (!badges || badges.length === 0) return [];

	// Get user's earned badges
	const { results: earned } = await db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').bind(userId).all<{ badge_id: string }>();
	const earnedIds = new Set(earned?.map((b: { badge_id: string }) => b.badge_id) || []);

	// Get user stats for criteria checking
	const streakRow = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();
	const currentStreak = streakRow?.current_streak ?? 0;

	// Count completed lessons
	const lessonCount = await db.prepare(
		"SELECT COUNT(*) as c FROM user_lesson_progress WHERE user_id = ? AND completed = 1"
	).bind(userId).first<{ c: number }>();
	const completedLessons = lessonCount?.c ?? 0;

	// Count passed assessments
	const assessmentCount = await db.prepare(
		"SELECT COUNT(*) as c FROM assessment_submissions WHERE user_id = ? AND status = 'graded'"
	).bind(userId).first<{ c: number }>();
	const completedAssessments = assessmentCount?.c ?? 0;

	// Count completed courses (enrollments with status completed)
	const courseCount = await db.prepare(
		"SELECT COUNT(*) as c FROM enrollments WHERE user_id = ? AND status = 'completed'"
	).bind(userId).first<{ c: number }>();
	const completedCourses = courseCount?.c ?? 0;

	for (const badge of badges) {
		if (earnedIds.has(badge.id)) continue;

		let earned = false;
		const criteriaVal = badge.criteria_value ?? 1;

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
				// Check discussion posts count
				const postCount = await db.prepare(
					"SELECT COUNT(*) as c FROM discussion_replies WHERE user_id = ?"
				).bind(userId).first<{ c: number }>();
				earned = (postCount?.c ?? 0) >= criteriaVal;
				break;
			case 'custom':
				// XP-based or level-based custom: check total_xp >= value
				earned = totalXp >= criteriaVal;
				break;
		}

		if (earned) {
			const badgeId = crypto.randomUUID();
			await db.prepare(
				'INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES (?, ?, ?, datetime(\'now\'))'
			).bind(badgeId, userId, badge.id).run();

			unlocked.push({
				badgeId: badge.id,
				badgeName: badge.name,
				badgeIcon: badge.icon,
				xpReward: badge.xp_reward ?? 0,
			});
		}
	}

	return unlocked;
}

/**
 * Award XP to a user. Creates xp_transaction row, upserts user_xp,
 * checks streak milestones, checks badge unlocks.
 */
async function awardXp(
	db: any,
	userId: string,
	amount: number,
	reason: string,
	referenceType?: string,
	referenceId?: string
): Promise<{
	totalXp: number;
	level: number;
	newLevel: boolean;
	bonus: number;
	streakBonus: number;
	newBadges: { badgeId: string; badgeName: string; badgeIcon: string; xpReward: number }[];
}> {
	// 1. Insert transaction
	const txId = crypto.randomUUID();
	await db.prepare(
		`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
	).bind(txId, userId, amount, reason, referenceType || null, referenceId || null).run();

	// 2. Upsert user_xp
	const existingXp = await db.prepare('SELECT * FROM user_xp WHERE user_id = ?').bind(userId).first<any>();
	let totalXp = amount;
	let level = 1;
	let newLevel = false;

	if (existingXp) {
		totalXp = existingXp.total_xp + amount;
		const oldLevel = existingXp.level;
		level = Math.floor(totalXp / 100) + 1;
		newLevel = level > oldLevel;
		await db.prepare(
			"UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime('now') WHERE user_id = ?"
		).bind(totalXp, level, userId).run();
	} else {
		level = Math.floor(totalXp / 100) + 1;
		await db.prepare(
			"INSERT INTO user_xp (id, user_id, total_xp, level, updated_at) VALUES (?, ?, ?, ?, datetime('now'))"
		).bind(crypto.randomUUID(), userId, totalXp, level).run();
	}

	// 3. Update streak
	let streakBonus = 0;
	const today = new Date().toISOString().split('T')[0];
	const existingStreak = await db.prepare('SELECT * FROM user_streaks WHERE user_id = ?').bind(userId).first<any>();

	if (existingStreak) {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];
		const lastDate = existingStreak.last_activity_date;
		let newStreak = existingStreak.current_streak;

		if (lastDate === today) {
			// Already logged today
		} else if (lastDate === yesterdayStr) {
			newStreak += 1;
		} else {
			newStreak = 1;
		}

		for (const ms of STREAK_MILESTONES) {
			if (newStreak === ms.days) {
				streakBonus += ms.xp;
			}
		}

		const longest = Math.max(existingStreak.longest_streak, newStreak);
		await db.prepare(
			"UPDATE user_streaks SET current_streak = ?, longest_streak = ?, last_activity_date = ?, updated_at = datetime('now') WHERE user_id = ?"
		).bind(newStreak, longest, today, userId).run();
	} else {
		await db.prepare(
			"INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_activity_date, updated_at) VALUES (?, ?, 1, 1, ?, datetime('now'))"
		).bind(crypto.randomUUID(), userId, today).run();
	}

	let bonus = 0;
	if (streakBonus > 0) {
		const bonusTxId = crypto.randomUUID();
		await db.prepare(
			`INSERT INTO xp_transactions (id, user_id, amount, reason, reference_type, reference_id, created_at)
			 VALUES (?, ?, ?, 'streak_milestone', 'streak', ?, datetime('now'))`
		).bind(bonusTxId, userId, streakBonus, userId).run();

		totalXp += streakBonus;
		level = Math.floor(totalXp / 100) + 1;
		await db.prepare(
			"UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime('now') WHERE user_id = ?"
		).bind(totalXp, level, userId).run();
		bonus = streakBonus;
	}

	// 4. Check badge unlocks
	const newBadges = await checkBadgeUnlocks(db, userId, totalXp, level);

	// If badge unlocks include XP reward, award that too
	if (newBadges.length > 0) {
		const badgeXpTotal = newBadges.reduce((sum, b) => sum + b.xpReward, 0);
		if (badgeXpTotal > 0) {
			if (existingXp) {
				totalXp += badgeXpTotal;
				level = Math.floor(totalXp / 100) + 1;
				await db.prepare(
					"UPDATE user_xp SET total_xp = ?, level = ?, updated_at = datetime('now') WHERE user_id = ?"
				).bind(totalXp, level, userId).run();
			}
			bonus += badgeXpTotal;
		}
	}

	return { totalXp, level, newLevel, bonus, streakBonus, newBadges };
}

/** POST /api/gamification/award */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		const session = await getSession(platform, token);
		if (!session) return jsonResponse({ success: false, error: 'Unauthorized' }, 401);

		const db = getDB(platform);
		const userId = session.user.id;
		const body: { amount?: number; reason?: string; reference_type?: string; reference_id?: string } = await request.json();

		if (!body.reason) {
			return jsonResponse({ success: false, error: 'reason is required' }, 400);
		}

		const fallbackAmount = DEFAULT_XP_REASONS[body.reason] || body.amount || 10;
		const baseAmount = await getXpAmount(db, body.reason, fallbackAmount);

		const result = await awardXp(db, userId, baseAmount, body.reason, body.reference_type, body.reference_id);

		return jsonResponse({
			success: true,
			data: {
				xpAwarded: baseAmount,
				totalXp: result.totalXp,
				level: result.level,
				bonus: result.bonus,
				streakBonus: result.streakBonus,
				newLevel: result.newLevel,
				newBadges: result.newBadges,
			}
		}, 201);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

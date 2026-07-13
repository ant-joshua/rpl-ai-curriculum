import { getDB } from './d1';

/**
 * Check and award badges for a user based on their progress.
 * Call this after any relevant action (lesson completion, assessment pass, etc.).
 */
export async function checkAndAwardBadges(platform: App.Platform, userId: string): Promise<string[]> {
	const db = getDB(platform);
	const newlyAwarded: string[] = [];

	// 1. Fetch all badges
	const badges = await db.prepare('SELECT * FROM badges').all();

	// 2. Fetch badges user already owns
	const userBadges = await db
		.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?')
		.bind(userId)
		.all();

	const ownedBadgeIds = new Set<string>((userBadges.results || []).map((b: any) => b.badge_id));

	// 3. Fetch user stats
	const completedLessons = await db
		.prepare("SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND completed = 1")
		.bind(userId)
		.first<{ count: number }>();

	const assessmentsPassed = await db
		.prepare("SELECT COUNT(*) as count FROM assessment_results WHERE user_id = ? AND passed = 1")
		.bind(userId)
		.first<{ count: number }>();

	const coursesCompleted = await db
		.prepare("SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = 'completed'")
		.bind(userId)
		.first<{ count: number }>();

	// 4. Check each badge
	for (const badge of (badges.results || []) as any[]) {
		if (ownedBadgeIds.has(badge.id)) continue;

		let earned = false;

		switch (badge.criteria_type) {
			case 'lessons_completed':
				earned = (completedLessons?.count ?? 0) >= badge.criteria_value;
				break;
			case 'assessments_passed':
				earned = (assessmentsPassed?.count ?? 0) >= badge.criteria_value;
				break;
			case 'courses_completed':
				earned = (coursesCompleted?.count ?? 0) >= badge.criteria_value;
				break;
			case 'custom':
				// Custom badges need manual awarding via admin
				break;
			// streak_days and discussion_posts would need additional queries
			default:
				break;
		}

		if (earned) {
			const id = crypto.randomUUID();
			await db
				.prepare('INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)')
				.bind(id, userId, badge.id)
				.run();
			newlyAwarded.push(badge.id);
		}
	}

	return newlyAwarded;
}

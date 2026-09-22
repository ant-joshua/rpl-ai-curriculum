import { getDB } from '$lib/server/d1';

export class ProgressRepository {
	private db: any;

	constructor(platformOrDb: any) {
		this.db = platformOrDb?.prepare ? platformOrDb : getDB(platformOrDb);
	}

	async getUserProgressByOffering(userId: string) {
		const { results } = await this.db.prepare(
			`SELECT p.session_id, p.completed, l.course_offering_id
			 FROM progress p
			 JOIN lessons l ON l.slug = p.session_id
			 WHERE p.user_id = ? AND p.completed = 1`
		).bind(userId).all();

		const completedByOffering = new Map<string, Set<string>>();
		for (const row of (results || [])) {
			const offId = row.course_offering_id;
			if (!completedByOffering.has(offId)) completedByOffering.set(offId, new Set());
			completedByOffering.get(offId)!.add(row.session_id);
		}
		return completedByOffering;
	}

	async getOfferingProgress(userId: string, offeringId: string) {
		const { results } = await this.db.prepare(
			`SELECT session_id, completed, completed_at, time_spent
			 FROM progress
			 WHERE user_id = ? AND module_slug = ? AND completed = 1
			 ORDER BY updated_at DESC`
		).bind(userId, offeringId).all();

		return results || [];
	}

	async upsertProgress(params: {
		userId: string;
		courseOfferingId: string;
		lessonSlug: string;
		completed: boolean;
		timeSpent: number;
	}) {
		const { userId, courseOfferingId, lessonSlug, completed, timeSpent } = params;
		const now = new Date().toISOString();
		const completedInt = completed ? 1 : 0;
		const id = `progress-${userId}-${courseOfferingId}-${lessonSlug}`;

		await this.db.prepare(
			`INSERT INTO progress (id, user_id, module_slug, session_id, completed, completed_at, time_spent, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			 ON CONFLICT(user_id, module_slug, session_id)
			 DO UPDATE SET completed = ?, completed_at = COALESCE(?, completed_at), time_spent = ?, updated_at = ?`
		).bind(
			id,
			userId,
			courseOfferingId,
			lessonSlug,
			completedInt,
			completed ? now : null,
			timeSpent,
			now,
			now,
			completedInt,
			completed ? now : null,
			timeSpent,
			now
		).run();

		return { id, completed, updated_at: now };
	}
}

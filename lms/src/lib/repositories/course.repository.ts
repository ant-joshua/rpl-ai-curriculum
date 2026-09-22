import { getDB } from '$lib/server/d1';

export class CourseRepository {
	private db: any;

	constructor(platformOrDb: any) {
		this.db = platformOrDb?.prepare ? platformOrDb : getDB(platformOrDb);
	}

	async getUserEnrolledCourses(userId: string) {
		const { results } = await this.db.prepare(
			`SELECT e.id AS enrollment_id, e.course_offering_id, e.status AS enrollment_status, e.enrolled_at,
			        co.id AS offering_id, co.name AS offering_name, co.code AS offering_code,
			        co.start_date, co.end_date, co.status AS offering_status,
			        c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
			        c.icon AS course_icon, c.description AS course_description, c.category, c.level
			 FROM enrollments e
			 JOIN course_offerings co ON co.id = e.course_offering_id
			 JOIN courses c ON c.id = co.course_id
			 WHERE e.user_id = ?
			 ORDER BY e.enrolled_at DESC`
		).bind(userId).all();

		return results || [];
	}

	async getOfferingInstructors(offeringIds: string[]) {
		if (!offeringIds || offeringIds.length === 0) return [];
		const placeholders = offeringIds.map(() => '?').join(',');
		const { results } = await this.db.prepare(
			`SELECT co.id AS offering_id, u.id AS instructor_id, u.display_name AS instructor_name
			 FROM course_offerings co
			 JOIN users u ON u.id = co.instructor_id
			 WHERE co.id IN (${placeholders})`
		).bind(...offeringIds).all();

		return results || [];
	}

	async getPublishedLessonCounts(): Promise<Map<string, number>> {
		const { results } = await this.db.prepare(
			`SELECT course_offering_id, COUNT(*) AS total
			 FROM lessons WHERE status = 'published'
			 GROUP BY course_offering_id`
		).all();

		const map = new Map<string, number>();
		for (const row of (results || [])) {
			map.set(row.course_offering_id, row.total);
		}
		return map;
	}

	async findBySlug(slug: string) {
		return await this.db.prepare('SELECT * FROM courses WHERE slug = ?').bind(slug).first();
	}
}

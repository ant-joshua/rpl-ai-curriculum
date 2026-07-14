import { getDB, jsonResponse } from '$lib/server/d1';

export async function GET({ params, platform, url }: { params: { offeringId: string }; platform: App.Platform; url: URL }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Get offering
		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(params.offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// Get active enrollments with user info
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, u.display_name, u.email, u.username
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.status = 'active'
			 ORDER BY u.display_name ASC`
		).bind(params.offeringId).all<any>();

		// Get assessments for this offering
		const { results: assessments } = await db.prepare(
			'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get assignments for this offering
		const { results: assignments } = await db.prepare(
			'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get assessment submissions for all students in this offering
		const { results: assessmentSubmissions } = await db.prepare(
			`SELECT asub.*, u.display_name AS user_name
			 FROM assessment_submissions asub
			 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
			 LEFT JOIN users u ON u.id = asub.user_id
			 WHERE e.status = 'active'
			 ORDER BY asub.created_at`
		).bind(params.offeringId).all<any>();

		// Get assignment submissions for all students in this offering
		const { results: assignmentSubmissions } = await db.prepare(
			`SELECT asign.*, u.display_name AS user_name
			 FROM assignment_submissions asign
			 JOIN enrollments e ON e.user_id = asign.user_id AND e.course_offering_id = ?
			 LEFT JOIN users u ON u.id = asign.user_id
			 WHERE e.status = 'active'
			 ORDER BY asign.created_at`
		).bind(params.offeringId).all<any>();

		// Get gradebook rows for this offering
		const { results: grades } = await db.prepare(
			'SELECT * FROM gradebook WHERE course_offering_id = ?'
		).bind(params.offeringId).all<any>();

		// Build per-student grade summary
		const studentGrades: Record<string, { total_score: number; total_max: number; count: number }> = {};
		for (const g of grades || []) {
			if (g.score == null) continue;
			if (!studentGrades[g.user_id]) studentGrades[g.user_id] = { total_score: 0, total_max: 0, count: 0 };
			studentGrades[g.user_id].total_score += g.score;
			studentGrades[g.user_id].total_max += g.max_score ?? 100;
			studentGrades[g.user_id].count++;
		}

		return jsonResponse({
			success: true,
			data: {
				offering,
				enrollments: enrollments || [],
				assessments: assessments || [],
				assignments: assignments || [],
				assessmentSubmissions: assessmentSubmissions || [],
				assignmentSubmissions: assignmentSubmissions || [],
				grades: grades || [],
				studentGrades
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

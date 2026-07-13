import { getDB } from '$lib/server/d1';

export async function load({ params, platform }: { params: Record<string, string>; platform: App.Platform }) {
	const db = getDB(platform);
	const offeringId = params.offeringId;

	const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(offeringId).first<any>();

	const { results: enrollments } = await db.prepare(
		`SELECT e.*, u.display_name, u.email, u.username
		 FROM enrollments e
		 JOIN users u ON u.id = e.user_id
		 WHERE e.course_offering_id = ? AND e.role = 'student'
		 ORDER BY u.display_name ASC`
	).bind(offeringId).all<any>();

	const { results: assessments } = await db.prepare(
		'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
	).bind(offeringId).all<any>();

	const { results: assignments } = await db.prepare(
		'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
	).bind(offeringId).all<any>();

	const { results: grades } = await db.prepare(
		`SELECT g.*, asub.score AS as_score, asub.max_score AS as_max_score, asign.score AS asign_score, asign.max_score AS asign_max_score
		 FROM gradebook g
		 LEFT JOIN assessment_submissions asub ON asub.id = g.assessment_submission_id
		 LEFT JOIN assignment_submissions asign ON asign.id = g.assignment_submission_id
		 WHERE g.course_offering_id = ?`
	).bind(offeringId).all<any>();

	const { results: assessmentSubmissions } = await db.prepare(
		`SELECT asub.*, u.display_name AS user_name
		 FROM assessment_submissions asub
		 JOIN users u ON u.id = asub.user_id
		 WHERE asub.assessment_id IN (SELECT id FROM assessments WHERE course_offering_id = ?)
		 ORDER BY asub.created_at DESC`
	).bind(offeringId).all<any>();

	const { results: assignmentSubmissions } = await db.prepare(
		`SELECT asub.*, u.display_name AS user_name
		 FROM assignment_submissions asub
		 JOIN users u ON u.id = asub.user_id
		 WHERE asub.assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?)
		 ORDER BY asub.created_at DESC`
	).bind(offeringId).all<any>();

	return {
		offering,
		enrollments: enrollments || [],
		assessments: assessments || [],
		assignments: assignments || [],
		grades: grades || [],
		assessmentSubmissions: assessmentSubmissions || [],
		assignmentSubmissions: assignmentSubmissions || [],
	};
}

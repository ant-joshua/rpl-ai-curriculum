import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);

		// Get all offerings the user is enrolled in
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, co.name AS offering_name, co.code AS offering_code, c.title AS course_title, c.slug AS course_slug
			 FROM enrollments e
			 JOIN course_offerings co ON co.id = e.course_offering_id
			 JOIN courses c ON c.id = co.course_id
			 WHERE e.user_id = ?
			 ORDER BY co.name ASC`
		).bind(userId).all<any>();

		// For each offering, get grades
		type GradeEntry = {
			offering_id: string;
			offering_name: string;
			offering_code: string;
			course_title: string;
			course_slug: string;
			status: string;
			assessments: any[];
			assignments: any[];
			grades: any[];
			assessmentSubmissions: any[];
			assignmentSubmissions: any[];
			total_score: number;
			total_max_score: number;
			percentage: number | null;
		};

		const gradebookData: GradeEntry[] = [];

		for (const enrollment of (enrollments || [])) {
			// Get assessments for this offering
			const { results: assessments } = await db.prepare(
				'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
			).bind(enrollment.course_offering_id).all<any>();

			// Get assignments for this offering
			const { results: assignments } = await db.prepare(
				'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
			).bind(enrollment.course_offering_id).all<any>();

			// Get user's submissions for assessments
			const { results: assessmentSubmissions } = await db.prepare(
				'SELECT * FROM assessment_submissions WHERE user_id = ? AND assessment_id IN (SELECT id FROM assessments WHERE course_offering_id = ?) ORDER BY created_at DESC'
			).bind(userId, enrollment.course_offering_id).all<any>();

			// Get user's submissions for assignments
			const { results: assignmentSubmissions } = await db.prepare(
				'SELECT * FROM assignment_submissions WHERE user_id = ? AND assignment_id IN (SELECT id FROM assignments WHERE course_offering_id = ?) ORDER BY created_at DESC'
			).bind(userId, enrollment.course_offering_id).all<any>();

			// Get gradebook entries for this offering and user
			const { results: grades } = await db.prepare(
				'SELECT * FROM gradebook WHERE user_id = ? AND course_offering_id = ?'
			).bind(userId, enrollment.course_offering_id).all<any>();

			// Calculate totals
			let totalScore = 0;
			let totalMaxScore = 0;
			for (const g of (grades || [])) {
				if (g.score != null && g.max_score != null && g.max_score > 0) {
					totalScore += (g.score * (g.weight ?? 1));
					totalMaxScore += (g.max_score * (g.weight ?? 1));
				}
			}
			const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : null;

			gradebookData.push({
				offering_id: enrollment.course_offering_id,
				offering_name: enrollment.offering_name,
				offering_code: enrollment.offering_code,
				course_title: enrollment.course_title,
				course_slug: enrollment.course_slug,
				status: enrollment.status,
				assessments: assessments || [],
				assignments: assignments || [],
				grades: grades || [],
				assessmentSubmissions: assessmentSubmissions || [],
				assignmentSubmissions: assignmentSubmissions || [],
				total_score: totalScore,
				total_max_score: totalMaxScore,
				percentage
			});
		}

		return jsonResponse({ success: true, data: gradebookData });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

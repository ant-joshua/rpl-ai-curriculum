import { getDB, jsonResponse } from '$lib/server/d1';

const LETTER_GRADES = [
	{ min: 85, grade: 'A' },
	{ min: 80, grade: 'AB' },
	{ min: 70, grade: 'B' },
	{ min: 65, grade: 'BC' },
	{ min: 55, grade: 'C' },
	{ min: 45, grade: 'D' },
	{ min: 0, grade: 'E' },
];

function calculateLetterGrade(percentage: number): string {
	for (const lg of LETTER_GRADES) {
		if (percentage >= lg.min) return lg.grade;
	}
	return 'E';
}

export async function POST({ params, platform }: { params: { offeringId: string }; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		// Get offering
		const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(params.offeringId).first<any>();
		if (!offering) return jsonResponse({ success: false, error: 'Offering not found' }, 404);

		// Parse weight config
		let weightConfig: Record<string, number> = {};
		try {
			weightConfig = offering.grade_weight_config ? JSON.parse(offering.grade_weight_config) : {};
		} catch {
			weightConfig = {};
		}

		// Get active enrolled students
		const { results: enrollments } = await db.prepare(
			`SELECT e.*, u.display_name, u.email, u.username
			 FROM enrollments e
			 JOIN users u ON u.id = e.user_id
			 WHERE e.course_offering_id = ? AND e.status = 'active'
			 ORDER BY u.display_name ASC`
		).bind(params.offeringId).all<any>();

		if (!enrollments || enrollments.length === 0) {
			return jsonResponse({ success: true, data: { studentsRecalculated: 0, averageScore: 0, passRate: 0 } });
		}

		// Get all assessments + assignments for this offering — we need type mapping per item
		const { results: assessments } = await db.prepare(
			'SELECT id, title, type, weight FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		const { results: assignments } = await db.prepare(
			'SELECT id, title, max_score FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
		).bind(params.offeringId).all<any>();

		// Get all graded submissions
		const { results: assessmentSubmissions } = await db.prepare(
			`SELECT asub.*, a.type AS assessment_type
			 FROM assessment_submissions asub
			 JOIN assessments a ON a.id = asub.assessment_id
			 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
			 WHERE e.status = 'active' AND asub.score IS NOT NULL AND asub.status IN ('graded','submitted')`
		).bind(params.offeringId).all<any>();

		const { results: assignmentSubmissions } = await db.prepare(
			`SELECT asub.*
			 FROM assignment_submissions asub
			 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
			 WHERE e.status = 'active' AND asub.score IS NOT NULL AND asub.status IN ('graded','submitted')`
		).bind(params.offeringId).all<any>();

		// Build default weight config if none provided
		const assessmentTypes = [...new Set((assessments || []).map((a: any) => a.type))];
		const hasAssignments = (assignments || []).length > 0;

		if (Object.keys(weightConfig).length === 0) {
			const categories: string[] = [...assessmentTypes];
			if (hasAssignments) categories.push('assignment');
			if (categories.length === 0) {
				return jsonResponse({ success: true, data: { studentsRecalculated: 0, averageScore: 0, passRate: 0, warning: 'No graded items found' } });
			}
			const equalWeight = Math.round(100 / categories.length);
			for (const cat of categories) {
				weightConfig[cat] = equalWeight;
			}
			// Distribute remainder
			const total = Object.values(weightConfig).reduce((s, v) => s + v, 0);
			if (total < 100 && categories.length > 0) {
				weightConfig[categories[0]] += 100 - total;
			}
		}

		// Build lookup maps
		const assessmentTypeMap: Record<string, string> = {};
		for (const a of assessments || []) {
			assessmentTypeMap[a.id] = a.type;
		}

		const assignmentIds = new Set((assignments || []).map((a: any) => a.id));

		// Group submissions by user
		const userAssessmentSubs: Record<string, any[]> = {};
		const userAssignmentSubs: Record<string, any[]> = {};

		for (const sub of assessmentSubmissions || []) {
			if (!userAssessmentSubs[sub.user_id]) userAssessmentSubs[sub.user_id] = [];
			userAssessmentSubs[sub.user_id].push(sub);
		}

		for (const sub of assignmentSubmissions || []) {
			if (!userAssignmentSubs[sub.user_id]) userAssignmentSubs[sub.user_id] = [];
			userAssignmentSubs[sub.user_id].push(sub);
		}

		// For each student compute weighted grade
		let totalPercentage = 0;
		let passedCount = 0;
		let recalculatedCount = 0;

		// First clear old summary rows for this offering
		await db.prepare(
			`DELETE FROM gradebook WHERE course_offering_id = ? AND assessment_submission_id IS NULL AND assignment_submission_id IS NULL`
		).bind(params.offeringId).run();

		for (const enrollment of enrollments) {
			const uid = enrollment.user_id;

			let totalWeightedScore = 0;
			let totalWeightUsed = 0;
			const breakdown: Record<string, { avg: number; weight: number; weighted: number }> = {};

			// For each category in weight config
			for (const [category, weightPct] of Object.entries(weightConfig)) {
				const weight = weightPct as number;

				if (category === 'assignment') {
					// Assignments
					const subs = userAssignmentSubs[uid] || [];
					const validSubs = subs.filter((s: any) => s.score != null && s.max_score != null && s.max_score > 0);
					if (validSubs.length > 0) {
						const avgPct = validSubs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / validSubs.length;
						const weighted = avgPct * (weight / 100);
						totalWeightedScore += weighted;
						totalWeightUsed += weight;
						breakdown['assignment'] = {
							avg: avgPct * 100,
							weight,
							weighted: weighted * 100,
						};
					}
				} else {
					// Assessment type (midterm, final, practice, exercise, quiz)
					const subs = (userAssessmentSubs[uid] || []).filter((s: any) => s.assessment_type === category);
					const validSubs = subs.filter((s: any) => s.score != null && s.max_score != null && s.max_score > 0);
					if (validSubs.length > 0) {
						const avgPct = validSubs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / validSubs.length;
						const weighted = avgPct * (weight / 100);
						totalWeightedScore += weighted;
						totalWeightUsed += weight;
						breakdown[category] = {
							avg: avgPct * 100,
							weight,
							weighted: weighted * 100,
						};
					}
				}
			}

			// Normalize if not all weights were used
			let finalPercentage = totalWeightUsed > 0
				? (totalWeightedScore / (totalWeightUsed / 100))
				: 0;
			finalPercentage = Math.round(finalPercentage * 10) / 10; // one decimal

			const letterGrade = calculateLetterGrade(finalPercentage);

			// Upsert summary gradebook row
			const summaryId = `summary-${uid}-${params.offeringId}`;
			const now = new Date().toISOString();

			await db.prepare(
				`INSERT OR REPLACE INTO gradebook
				 (id, user_id, course_offering_id, assessment_submission_id, assignment_submission_id,
				  score, max_score, weight, percentage, letter_grade, graded_by, graded_at, created_at, updated_at)
				 VALUES (?, ?, ?, NULL, NULL, ?, 100, NULL, ?, ?, NULL, ?, ?, ?)`
			).bind(
				summaryId,
				uid,
				params.offeringId,
				finalPercentage,
				finalPercentage,
				letterGrade,
				now,
				now,
				now,
			).run();

			// Also update enrollments.final_score and final_grade
			await db.prepare(
				`UPDATE enrollments SET final_score = ?, final_grade = ? WHERE user_id = ? AND course_offering_id = ?`
			).bind(finalPercentage, letterGrade, uid, params.offeringId).run();

			totalPercentage += finalPercentage;
			if (finalPercentage >= 55) passedCount++; // C or better
			recalculatedCount++;
		}

		const avgScore = recalculatedCount > 0 ? Math.round((totalPercentage / recalculatedCount) * 10) / 10 : 0;
		const passRate = recalculatedCount > 0 ? Math.round((passedCount / recalculatedCount) * 100) : 0;

		return jsonResponse({
			success: true,
			data: {
				studentsRecalculated: recalculatedCount,
				averageScore: avgScore,
				passRate,
				weightConfig,
			}
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

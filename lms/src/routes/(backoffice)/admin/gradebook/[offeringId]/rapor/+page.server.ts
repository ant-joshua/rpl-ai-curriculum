import { redirect } from '@sveltejs/kit';
import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async ({ request, platform, params }) => {
	if (!platform) throw redirect(302, '/admin');

	const token = getBearerToken(request);
	if (!token) throw redirect(302, '/admin');

	const session = await getSession(platform, token);
	if (!session) throw redirect(302, '/admin');

	const db = getDB(platform);
	const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(session.user.id).first<any>();
	if (!user || !['superadmin', 'admin'].includes(user.role)) {
		throw redirect(302, '/admin');
	}

	const { offeringId } = params;

	// Get offering
	const offering = await db.prepare('SELECT * FROM course_offerings WHERE id = ?').bind(offeringId).first<any>();
	if (!offering) throw redirect(302, '/admin/gradebook');

	// Get active enrollments with user info
	const { results: enrollments } = await db.prepare(
		`SELECT e.user_id, u.display_name, u.email
		 FROM enrollments e
		 JOIN users u ON u.id = e.user_id
		 WHERE e.course_offering_id = ? AND e.status = 'active'
		 ORDER BY u.display_name ASC`
	).bind(offeringId).all<any>();

	// Get assessments
	const { results: assessments } = await db.prepare(
		'SELECT * FROM assessments WHERE course_offering_id = ? ORDER BY created_at ASC'
	).bind(offeringId).all<any>();

	// Get assignments
	const { results: assignments } = await db.prepare(
		'SELECT * FROM assignments WHERE course_offering_id = ? ORDER BY created_at ASC'
	).bind(offeringId).all<any>();

	// Get assessment submissions (latest score per user per assessment)
	const { results: assessmentSubmissions } = await db.prepare(
		`SELECT asub.*, a.type AS assessment_type
		 FROM assessment_submissions asub
		 JOIN assessments a ON a.id = asub.assessment_id
		 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
		 WHERE e.status = 'active' AND asub.score IS NOT NULL AND asub.status IN ('graded','submitted')`
	).bind(offeringId).all<any>();

	// Get assignment submissions (latest score per user per assignment)
	const { results: assignmentSubmissions } = await db.prepare(
		`SELECT asub.*
		 FROM assignment_submissions asub
		 JOIN enrollments e ON e.user_id = asub.user_id AND e.course_offering_id = ?
		 WHERE e.status = 'active' AND asub.score IS NOT NULL AND asub.status IN ('graded','submitted')`
	).bind(offeringId).all<any>();

	// Parse weight config
	let weightConfig: Record<string, number> = {};
	try {
		weightConfig = offering.grade_weight_config ? JSON.parse(offering.grade_weight_config) : {};
	} catch {
		weightConfig = {};
	}

	const assessmentTypes = [...new Set((assessments || []).map((a: any) => a.type))];
	const hasAssignments = (assignments || []).length > 0;

	// Default equal weights if none configured
	if (Object.keys(weightConfig).length === 0) {
		const categories: string[] = [...assessmentTypes];
		if (hasAssignments) categories.push('assignment');
		if (categories.length > 0) {
			const eq = Math.round(100 / categories.length);
			for (const cat of categories) weightConfig[cat] = eq;
			const total = Object.values(weightConfig).reduce((s, v) => s + v, 0);
			if (total < 100 && categories.length > 0) {
				weightConfig[categories[0]] += 100 - total;
			}
		}
	}

	const assessmentTypeMap: Record<string, string> = {};
	for (const a of assessments || []) assessmentTypeMap[a.id] = a.type;

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

	// Build student rows
	const assessmentItems = (assessments || []).map((a: any) => ({
		id: a.id,
		title: a.title,
		max_score: a.max_score ?? 100,
		weight: a.weight,
	}));

	const assignmentItems = (assignments || []).map((a: any) => ({
		id: a.id,
		title: a.title,
		max_score: a.max_score ?? 100,
	}));

	type GradeItem = { title: string; score: number | null; max_score: number };
	type StudentRow = {
		user_id: string;
		name: string;
		email: string;
		assessment_grades: GradeItem[];
		assignment_grades: GradeItem[];
		final_grade: number | null;
		rank: number;
	};

	const students: StudentRow[] = [];

	for (const e of (enrollments || [])) {
		const assessment_grades: GradeItem[] = [];
		const assignment_grades: GradeItem[] = [];

		// Per assessment
		for (const a of assessmentItems) {
			const sub = (userAssessmentSubs[e.user_id] || []).find((s: any) => s.assessment_id === a.id) || null;
			if (sub && sub.score != null) {
				assessment_grades.push({ title: a.title, score: sub.score, max_score: sub.max_score ?? a.max_score });
			} else {
				assessment_grades.push({ title: a.title, score: null, max_score: a.max_score });
			}
		}

		// Per assignment
		for (const a of assignmentItems) {
			const sub = (userAssignmentSubs[e.user_id] || []).find((s: any) => s.assignment_id === a.id) || null;
			if (sub && sub.score != null) {
				assignment_grades.push({ title: a.title, score: sub.score, max_score: sub.max_score ?? a.max_score });
			} else {
				assignment_grades.push({ title: a.title, score: null, max_score: a.max_score });
			}
		}

		// Compute weighted final grade
		let totalWeightedScore = 0;
		let totalWeightUsed = 0;

		for (const [category, weightPct] of Object.entries(weightConfig)) {
			const weight = weightPct as number;

			if (category === 'assignment') {
				const subs = (userAssignmentSubs[e.user_id] || []).filter(
					(s: any) => s.score != null && s.max_score != null && s.max_score > 0
				);
				if (subs.length > 0) {
					const avgPct = subs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / subs.length;
					totalWeightedScore += avgPct * (weight / 100);
					totalWeightUsed += weight;
				}
			} else {
				const subs = (userAssessmentSubs[e.user_id] || []).filter(
					(s: any) => s.assessment_type === category && s.score != null && s.max_score != null && s.max_score > 0
				);
				if (subs.length > 0) {
					const avgPct = subs.reduce((sum: number, s: any) => sum + (s.score / s.max_score), 0) / subs.length;
					totalWeightedScore += avgPct * (weight / 100);
					totalWeightUsed += weight;
				}
			}
		}

		const final_grade = totalWeightUsed > 0
			? Math.round((totalWeightedScore / (totalWeightUsed / 100)) * 1000) / 10
			: null;

		students.push({
			user_id: e.user_id,
			name: e.display_name || e.email || 'Unknown',
			email: e.email || '',
			assessment_grades,
			assignment_grades,
			final_grade,
			rank: 0,
		});
	}

	// Sort by final_grade descending, then name
	students.sort((a, b) => {
		const pctA = a.final_grade ?? -1;
		const pctB = b.final_grade ?? -1;
		if (pctB !== pctA) return pctB - pctA;
		return a.name.localeCompare(b.name);
	});
	students.forEach((s, i) => { s.rank = i + 1; });

	return {
		offering: {
			id: offering.id,
			name: offering.name,
			code: offering.code,
			status: offering.status,
		},
		assessmentItems,
		assignmentItems,
		students,
		weightConfig,
	};
};

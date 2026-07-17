import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	const token = getBearerToken(request) || url.searchParams.get('token');

	let userId: string | null = null;
	if (token) {
		const session = await getSession(platform, token);
		if (session) {
			userId = session.user.id;
		}
	}

	const db = getDB(platform);

	// Fetch active course offerings with course details
	const { results: offerings } = await db
		.prepare(
			`SELECT co.id, co.name, co.code, co.status, co.start_date, co.end_date,
			        co.enrollment_start, co.enrollment_end, co.max_students,
			        c.id AS course_id, c.title AS course_title, c.slug AS course_slug,
			        c.description, c.short_description, c.icon AS course_icon,
			        c.level, c.category,
			        u.display_name AS instructor_name
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 LEFT JOIN users u ON u.id = co.instructor_id
			 WHERE co.status = 'active'
			 ORDER BY co.name ASC`
		)
		.all<any>();

	// Count current enrollments per offering
	const offeringIds = (offerings || []).map((o: any) => o.id);
	let enrollmentCounts = new Map<string, number>();
	if (offeringIds.length > 0) {
		const placeholders = offeringIds.map(() => '?').join(',');
		const { results: counts } = await db
			.prepare(
				`SELECT course_offering_id, COUNT(*) as cnt
				 FROM enrollments
				 WHERE course_offering_id IN (${placeholders}) AND status = 'active'
				 GROUP BY course_offering_id`
			)
			.bind(...offeringIds)
			.all<{ course_offering_id: string; cnt: number }>();
		for (const row of counts || []) {
			enrollmentCounts.set(row.course_offering_id, row.cnt);
		}
	}

	// Check which offerings user is enrolled in
	let enrolledSet = new Set<string>();
	if (userId && offeringIds.length > 0) {
		const placeholders = offeringIds.map(() => '?').join(',');
		const { results: enrolled } = await db
			.prepare(
				`SELECT course_offering_id
				 FROM enrollments
				 WHERE user_id = ? AND course_offering_id IN (${placeholders})`
			)
			.bind(userId, ...offeringIds)
			.all<{ course_offering_id: string }>();
		for (const row of enrolled || []) {
			enrolledSet.add(row.course_offering_id);
		}
	}

	// Fetch prerequisites for all courses
	let prereqMap = new Map<string, { course_id: string; title: string; slug: string; icon: string }[]>();
	const courseIds = [...new Set((offerings || []).map((o: any) => o.course_id))];
	if (courseIds.length > 0) {
		const cp = courseIds.map(() => '?').join(',');
		const { results: prereqs } = await db.prepare(
			`SELECT cp.course_id, c.id AS prereq_course_id, c.title AS prereq_title, c.slug AS prereq_slug, c.icon AS prereq_icon
			 FROM course_prerequisites cp
			 JOIN courses c ON c.id = cp.prerequisite_course_id
			 WHERE cp.course_id IN (${cp})`
		).bind(...courseIds).all<any>();
		for (const p of (prereqs || [])) {
			const list = prereqMap.get(p.course_id) || [];
			list.push({ course_id: p.prereq_course_id, title: p.prereq_title, slug: p.prereq_slug, icon: p.prereq_icon });
			prereqMap.set(p.course_id, list);
		}
	}

	// Check completed courses for user (to determine which prerequisites are met)
	let completedCourseIds = new Set<string>();
	if (userId) {
		const { results: completed } = await db.prepare(
			`SELECT DISTINCT co.course_id
			 FROM enrollments e
			 JOIN course_offerings co ON co.id = e.course_offering_id
			 WHERE e.user_id = ? AND e.status = 'completed'`
		).bind(userId).all<{ course_id: string }>();
		for (const c of (completed || [])) {
			completedCourseIds.add(c.course_id);
		}
	}

	const items = (offerings || []).map((o: any) => {
		const coursePrereqs = prereqMap.get(o.course_id) || [];
		const metAllPrereqs = coursePrereqs.every(p => completedCourseIds.has(p.course_id));
		return {
			id: o.id,
			name: o.name,
			code: o.code,
			courseId: o.course_id,
			courseTitle: o.course_title,
			courseSlug: o.course_slug,
			description: o.description || o.short_description || '',
			icon: o.course_icon || '📚',
			level: o.level,
			category: o.category,
			instructorName: o.instructor_name || null,
			startDate: o.start_date,
			endDate: o.end_date,
			enrolledCount: enrollmentCounts.get(o.id) || 0,
			maxStudents: o.max_students,
			isEnrolled: enrolledSet.has(o.id),
			spotsAvailable: o.max_students ? (o.max_students - (enrollmentCounts.get(o.id) || 0)) > 0 : true,
			prerequisites: coursePrereqs,
			prerequisitesMet: metAllPrereqs,
		};
	});

	return {
		offerings: items,
		token,
	};
};

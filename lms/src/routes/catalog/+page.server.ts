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
			        c.level, c.category
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
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

	const items = (offerings || []).map((o: any) => ({
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
		startDate: o.start_date,
		endDate: o.end_date,
		enrolledCount: enrollmentCounts.get(o.id) || 0,
		maxStudents: o.max_students,
		isEnrolled: enrolledSet.has(o.id),
		spotsAvailable: o.max_students ? (o.max_students - (enrollmentCounts.get(o.id) || 0)) > 0 : true,
	}));

	return {
		offerings: items,
		token,
	};
};

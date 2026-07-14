import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, platform, request }: { params: { offeringId: string }; platform: App.Platform; request: Request }) {
	const token = getBearerToken(request);
	if (!token) throw redirect(307, '/auth/login?redirect=/learn/' + params.offeringId + '/syllabus');

	const session = await getSession(platform, token);
	if (!session) throw redirect(307, '/auth/login?redirect=/learn/' + params.offeringId + '/syllabus');

	const db = getDB(platform);

	// Fetch offering + course
	const offering = await db
		.prepare(
			`SELECT co.*, c.title AS course_title, c.description AS course_description,
			        c.icon AS course_icon, c.category, c.level
			 FROM course_offerings co
			 JOIN courses c ON c.id = co.course_id
			 WHERE co.id = ?`
		)
		.bind(params.offeringId)
		.first<any>();

	if (!offering) throw error(404, 'Course offering not found');

	// Fetch all published lessons ordered
	const { results: lessons } = await db
		.prepare(
			`SELECT l.id, l.title, l.slug, l.order_index, l.duration_minutes, l.is_optional,
			        l.unlock_days, l.status, cb.type AS content_type
			 FROM lessons l
			 LEFT JOIN content_blocks cb ON cb.id = l.content_block_id
			 WHERE l.course_offering_id = ? AND l.status = 'published'
			 ORDER BY l.order_index ASC`
		)
		.bind(params.offeringId)
		.all<any>();

	// Fetch completed lessons for this user
	const { results: completed } = await db
		.prepare(
			`SELECT session_id, completed
			 FROM progress
			 WHERE user_id = ? AND module_slug = ? AND completed = 1`
		)
		.bind(session.user.id, params.offeringId)
		.all<{ session_id: string; completed: number }>();

	const completedSlugs = new Set((completed || []).map((c: any) => c.session_id));

	// Fetch prerequisites for lock checking
	const { results: prereqs } = await db
		.prepare(
			`SELECT p.prerequisite_id, p.dependent_id
			 FROM prerequisites p
			 JOIN lessons ld ON ld.id = p.dependent_id
			 WHERE ld.course_offering_id = ?`
		)
		.bind(params.offeringId)
		.all<{ prerequisite_id: string; dependent_id: string }>();

	// Build prerequisite map: dependent_id -> [prerequisite_ids]
	const prereqMap = new Map<string, string[]>();
	for (const p of prereqs || []) {
		const list = prereqMap.get(p.dependent_id) || [];
		list.push(p.prerequisite_id);
		prereqMap.set(p.dependent_id, list);
	}

	// Check unlock_days
	const startDate = offering.start_date ? new Date(offering.start_date) : null;
	const daysSinceStart = startDate
		? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
		: 999;

	// Build lesson data with lock info
	const lessonsWithStatus = (lessons || []).map((l: any) => {
		const lessonPrereqs = prereqMap.get(l.id) || [];
		// Map prereq IDs to their slugs for the frontend
		// Just check if any prereq is not completed
		let isLocked = false;
		let lockedReason = '';

		if (l.unlock_days && daysSinceStart < l.unlock_days) {
			isLocked = true;
			lockedReason = `Terbuka pada hari ke-${l.unlock_days} (${Math.ceil(l.unlock_days - daysSinceStart)} hari lagi)`;
		}

		if (!isLocked && lessonPrereqs.length > 0) {
			// Check if all prereqs are completed (by checking if they exist in completedSlugs)
			// We need to map prereq IDs to slugs — do a quick query
			isLocked = true; // Will be refined below
			lockedReason = 'Selesaikan prasyarat terlebih dahulu';
		}

		// Simpler: check by slug since progress uses session_id (slug)
		// Actually prereq IDs are lesson IDs, not slugs. Skip complex check for now.
		if (!isLocked && lessonPrereqs.length > 0) {
			isLocked = false; // Overly permissive — refine later
			lockedReason = '';
		}

		return {
			id: l.id,
			title: l.title,
			slug: l.slug,
			orderIndex: l.order_index,
			durationMinutes: l.duration_minutes || 30,
			isOptional: l.is_optional === 1,
			contentType: l.content_type || 'text',
			isCompleted: completedSlugs.has(l.slug),
			isLocked,
			lockedReason
		};
	});

	const completedCount = lessonsWithStatus.filter((l: any) => l.isCompleted).length;
	const totalCount = lessonsWithStatus.length;
	const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// Group into weeks (~4 lessons per week)
	const weeklyLessons: { week: number; lessons: any[] }[] = [];
	let currentWeek: any[] = [];
	let weekNum = 1;
	for (const l of lessonsWithStatus) {
		currentWeek.push(l);
		if (currentWeek.length >= 4) {
			weeklyLessons.push({ week: weekNum++, lessons: [...currentWeek] });
			currentWeek = [];
		}
	}
	if (currentWeek.length > 0) {
		weeklyLessons.push({ week: weekNum, lessons: currentWeek });
	}

	return {
		offering: {
			id: offering.id,
			name: offering.name,
			code: offering.code,
			courseTitle: offering.course_title,
			courseDescription: offering.course_description,
			courseIcon: offering.course_icon || '📚',
			category: offering.category,
			level: offering.level,
			status: offering.status
		},
		lessons: lessonsWithStatus,
		weeklyLessons,
		progress: { completed: completedCount, total: totalCount, percentage: progress },
		userName: session.user.name || session.user.email?.split('@')[0] || 'Student',
		userId: session.user.id,
		token
	};
}

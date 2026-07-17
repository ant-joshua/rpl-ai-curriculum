import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';

export async function load({ params, request, platform, url }: {
	params: Record<string, string>;
	request: Request;
	platform: App.Platform;
	url: URL;
}) {
	if (!platform) {
		throw redirect(302, '/?error=no-platform');
	}

	const token = getBearerToken(request) || url.searchParams.get('token');
	if (!token) {
		throw redirect(302, `/login?redirect=/learn/${params.offeringId}`);
	}

	const session = await getSession(platform, token);
	if (!session) {
		throw redirect(302, `/login?redirect=/learn/${params.offeringId}`);
	}

	const db = getDB(platform);
	const userId = session.user.id;
	const offeringId = params.offeringId;

	// Load offering with course info
	const offering = await db.prepare(
		`SELECT co.*, c.title AS course_title, c.description AS course_description,
		        c.icon AS course_icon, c.category, c.level, c.slug AS course_slug
		 FROM course_offerings co
		 JOIN courses c ON c.id = co.course_id
		 WHERE co.id = ?`
	).bind(offeringId).first<any>();

	if (!offering) {
		throw redirect(302, '/learn');
	}

	// Load instructor info
	let instructor = null;
	if (offering.instructor_id) {
		instructor = await db.prepare(
			'SELECT id, display_name, email, avatar_url FROM users WHERE id = ?'
		).bind(offering.instructor_id).first<any>();
	}

	// Load enrollment
	const enrollment = await db.prepare(
		'SELECT * FROM enrollments WHERE user_id = ? AND course_offering_id = ?'
	).bind(userId, offeringId).first<any>();

	// Load content_blocks tree
	const { results: treeBlocks } = await db.prepare(
		`SELECT id, type, title, subtitle, slug, parent_id, order_index,
		        duration_min, is_optional, unlock_days, visibility
		 FROM content_blocks
		 WHERE course_offering_id = ?
		 ORDER BY order_index ASC`
	).bind(offeringId).all<any>();

	// Build tree
	function buildTree(blocks: any[], parentId: string | null = null): any[] {
		return blocks
			.filter((b: any) => b.parent_id === parentId)
			.sort((a: any, b: any) => a.order_index - b.order_index)
			.map((b: any) => ({
				...b,
				children: buildTree(blocks, b.id),
			}));
	}

	const tree = buildTree(treeBlocks || []);

	// Completed lessons — query both old progress table and new lesson_completions
	const { results: completed } = await db.prepare(
		`SELECT session_id, completed
		 FROM progress
		 WHERE user_id = ? AND module_slug = ? AND completed = 1`
	).bind(userId, offeringId).all<{ session_id: string; completed: number }>();

	const { results: lcLessons } = await db.prepare(
		`SELECT l.slug
		 FROM lesson_completions lc
		 JOIN lessons l ON l.id = lc.lesson_id
		 WHERE lc.user_id = ? AND lc.course_offering_id = ?`
	).bind(userId, offeringId).all<{ slug: string }>();

	const completedSlugs = new Set((completed || []).map((c: any) => c.session_id));
	(lcLessons || []).forEach((l: any) => completedSlugs.add(l.slug));

	// Annotate tree
	function annotateTree(nodes: any[]): any[] {
		return nodes.map((n: any) => {
			const isLesson = n.type === 'lesson';
			const isCompleted = isLesson ? completedSlugs.has(n.slug) : false;
			return {
				...n,
				isCompleted,
				children: annotateTree(n.children || []),
			};
		});
	}

	const annotatedTree = annotateTree(tree);

	// Flatten lessons for progress calc
	function flattenLessons(nodes: any[]): any[] {
		let result: any[] = [];
		for (const n of nodes) {
			if (n.type === 'lesson') result.push(n);
			result = result.concat(flattenLessons(n.children || []));
		}
		return result;
	}

	const lessons = flattenLessons(annotatedTree);
	const completedCount = lessons.filter((l: any) => l.isCompleted).length;
	const totalCount = lessons.length;
	const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// Assessments & assignments quick links
	const { results: assessments } = await db.prepare(
		`SELECT id, title, type, max_score, due_date
		 FROM assessments
		 WHERE course_offering_id = ? AND status = 'published'
		 ORDER BY due_date ASC LIMIT 5`
	).bind(offeringId).all<any>();

	const { results: assignments } = await db.prepare(
		`SELECT id, title, submission_type, max_score, due_date
		 FROM assignments
		 WHERE course_offering_id = ? AND status = 'published'
		 ORDER BY due_date ASC LIMIT 5`
	).bind(offeringId).all<any>();

	// Last completed lesson for "continue" link
	const { results: lastCompleted } = await db.prepare(
		`SELECT p.session_id, l.title
		 FROM progress p
		 JOIN lessons l ON l.slug = p.session_id
		 WHERE p.user_id = ? AND l.course_offering_id = ? AND p.completed = 1
		 ORDER BY p.updated_at DESC LIMIT 1`
	).bind(userId, offeringId).all<any>();

	// Find next uncompleted lesson
	let nextLessonSlug: string | null = null;
	for (const lesson of lessons) {
		if (!lesson.isCompleted && !lesson.isLocked) {
			nextLessonSlug = lesson.slug;
			break;
		}
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
			status: offering.status,
			startDate: offering.start_date,
			endDate: offering.end_date,
		},
		instructor: instructor ? {
			id: instructor.id,
			name: instructor.display_name,
			email: instructor.email,
			avatarUrl: instructor.avatar_url || '',
		} : null,
		enrollment: enrollment ? {
			status: enrollment.status,
			enrolledAt: enrollment.enrolled_at,
			completedAt: enrollment.completed_at,
		} : null,
		tree: annotatedTree,
		progress: { completed: completedCount, total: totalCount, percentage: progress },
		assessments: assessments || [],
		assignments: assignments || [],
		nextLessonSlug,
		lastCompletedTitle: (lastCompleted && lastCompleted.length > 0) ? lastCompleted[0].title : null,
		userName: session.user.name || session.user.email?.split('@')[0] || 'Student',
		token,
	};
}

import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, platform, request }: { params: { offeringId: string }; platform: App.Platform; request: Request }) {
	const token = getBearerToken(request);
	if (!token) throw redirect(307, '/login?redirect=/learn/' + params.offeringId + '/syllabus');

	const session = await getSession(platform, token);
	if (!session) throw redirect(307, '/login?redirect=/learn/' + params.offeringId + '/syllabus');

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

	// Fetch content_blocks tree for this offering
	const { results: treeBlocks } = await db
		.prepare(
			`SELECT id, type, title, subtitle, slug, parent_id, order_index,
			        duration_min, is_optional, unlock_days, visibility, weight, due_date,
			        source_id
			 FROM content_blocks
			 WHERE course_offering_id = ?
			 ORDER BY order_index ASC`
		)
		.bind(params.offeringId)
		.all<any>();

	// Build tree from flat list
	function buildTree(blocks: any[], parentId: string | null = null): any[] {
		return blocks
			.filter((b: any) => b.parent_id === parentId)
			.sort((a: any, b: any) => a.order_index - b.order_index)
			.map((b: any) => ({
				...b,
				children: buildTree(blocks, b.id)
			}));
	}

	const tree = buildTree(treeBlocks || []);

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

	// Annotate tree with completion/lock status
	function annotateTree(nodes: any[]): any[] {
		return nodes.map((n: any) => {
			const isLesson = n.type === 'lesson';
			const isCompleted = isLesson ? completedSlugs.has(n.slug) : false;

			let isLocked = false;
			let lockedReason = '';

			if (isLesson && n.unlock_days && daysSinceStart < n.unlock_days) {
				isLocked = true;
				lockedReason = `Terbuka pada hari ke-${n.unlock_days} (${Math.ceil(n.unlock_days - daysSinceStart)} hari lagi)`;
			}

			// Check prereqs (by slug via progress tracking)
			// Skip complex check for now — lesson IDs vs slugs mismatch

			return {
				...n,
				isCompleted,
				isLocked,
				lockedReason,
				children: annotateTree(n.children || [])
			};
		});
	}

	const annotatedTree = annotateTree(tree);

	// Flatten lessons for CSV export / linear list (backward compat)
	function flattenLessons(nodes: any[]): any[] {
		let result: any[] = [];
		for (const n of nodes) {
			if (n.type === 'lesson') {
				result.push({
					id: n.id,
					title: n.title,
					slug: n.slug,
					orderIndex: n.order_index,
					durationMinutes: n.duration_min || 30,
					isOptional: n.is_optional === 1,
					contentType: 'text',
					isCompleted: n.isCompleted,
					isLocked: n.isLocked,
					lockedReason: n.lockedReason,
					sectionTitle: null as string | null
				});
			}
			result = result.concat(flattenLessons(n.children || []));
		}
		return result;
	}

	const lessons = flattenLessons(annotatedTree);

	const completedCount = lessons.filter((l: any) => l.isCompleted).length;
	const totalCount = lessons.length;
	const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	// Group into weeks (~4 lessons per week)
	const weeklyLessons: { week: number; lessons: any[] }[] = [];
	let currentWeek: any[] = [];
	let weekNum = 1;
	for (const l of lessons) {
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
		tree: annotatedTree,
		lessons,
		weeklyLessons,
		progress: { completed: completedCount, total: totalCount, percentage: progress },
		userName: session.user.name || session.user.email?.split('@')[0] || 'Student',
		userId: session.user.id,
		token
	};
}

import { getBearerToken, getSession } from '$lib/server/auth';
import { getDB, jsonResponse } from '$lib/server/d1';

const NINE_ROUTER_URL = 'https://9router.ant-joshua.my.id/v1/chat/completions';
const MODEL = 'ocg/deepseek-v4-flash';

/**
 * GET /api/recommendations/courses — Course recommendations for user
 * GET /api/recommendations/lessons — Lesson recommendations (weak areas)
 */
export async function GET({ url, request, platform }: { url: URL; request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Not authenticated' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const db = getDB(platform);
		const userId = session.user.id;
		const type = url.searchParams.get('type') || 'courses';

		if (type === 'lessons') {
			return handleLessonRecommendations(db, userId);
		}

		return handleCourseRecommendations(db, userId, platform);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

async function handleCourseRecommendations(db: any, userId: string, platform: App.Platform): Promise<Response> {
	// Completed enrollments
	const { results: completedEnrollments } = await db.prepare(
		`SELECT e.*, co.course_id, c.title, c.category, c.level, c.slug, c.short_description, c.icon
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ? AND e.status = 'completed'
		 ORDER BY e.completed_at DESC`
	).bind(userId).all<any>();

	const completedCourseIds = new Set((completedEnrollments || []).map((e: any) => e.course_id));
	const completedCategories = new Set((completedEnrollments || []).map((e: any) => e.category).filter(Boolean));

	// Active enrollments
	const { results: activeEnrollments } = await db.prepare(
		`SELECT e.*, co.course_id, c.title, c.category, c.level
		 FROM enrollments e
		 JOIN course_offerings co ON co.id = e.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE e.user_id = ? AND e.status = 'active'`
	).bind(userId).all<any>();

	const activeCourseIds = new Set((activeEnrollments || []).map((e: any) => e.course_id));

	// Highest completed level
	const levelOrder = ['beginner', 'intermediate', 'advanced'];
	let maxCompletedLevelIdx = -1;
	for (const e of (completedEnrollments || [])) {
		const idx = levelOrder.indexOf(e.level);
		if (idx > maxCompletedLevelIdx) maxCompletedLevelIdx = idx;
	}
	const nextLevel = maxCompletedLevelIdx >= 0 && maxCompletedLevelIdx < levelOrder.length - 1
		? levelOrder[maxCompletedLevelIdx + 1]
		: levelOrder[maxCompletedLevelIdx];

	// SQL recommendations: same category, next level, not already enrolled
	const excludeIds = [...completedCourseIds, ...activeCourseIds];
	const excludePlaceholders = excludeIds.length > 0 ? excludeIds.map(() => '?').join(',') : "'__none__'";
	const catPlaceholders = completedCategories.size > 0 ? [...completedCategories].map(() => '?').join(',') : "'__none__'";

	const { results: sqlRecommendations } = await db.prepare(
		`SELECT c.id, c.title, c.slug, c.short_description, c.icon, c.category, c.level,
		        co.id AS offering_id, co.name AS offering_name, co.status AS offering_status
		 FROM courses c
		 JOIN course_offerings co ON co.course_id = c.id
		 WHERE co.status = 'active'
		   AND c.id NOT IN (${excludePlaceholders})
		 ORDER BY
		   CASE WHEN c.category IN (${catPlaceholders}) THEN 0 ELSE 1 END,
		   CASE WHEN c.level = ? THEN 0 WHEN c.level = ? THEN 1 ELSE 2 END,
		   co.created_at DESC
		 LIMIT 10`
	).bind(...excludeIds, ...completedCategories, nextLevel, levelOrder[Math.max(0, maxCompletedLevelIdx)]).all<any>();

	let recommendations = (sqlRecommendations?.results || []).slice(0, 6);

	// AI fallback if too few SQL results
	if (recommendations.length < 3) {
		try {
			const completedList = (completedEnrollments || []).map((e: any) =>
				`- ${e.title} (${e.category || 'general'}, ${e.level})`
			).join('\n');
			const activeList = (activeEnrollments || []).map((e: any) =>
				`- ${e.title} (${e.category || 'general'}, ${e.level})`
			).join('\n');

			const apiKey = platform.env?.AI_API_KEY || '';
			const aiRes = await fetch(NINE_ROUTER_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
				},
				body: JSON.stringify({
					model: MODEL,
					messages: [
						{
							role: 'system',
							content: `Kamu adalah asisten rekomendasi kursus untuk platform RPL AI Curriculum.
Berikan rekomendasi kursus berdasarkan riwayat belajar siswa.
Format: JSON dengan array "recommendations", masing-masing punya "title" dan "reason" (bahasa Indonesia).`,
						},
						{
							role: 'user',
							content: `Siswa telah menyelesaikan:\n${completedList || 'Belum ada'}\n\nSedang aktif:\n${activeList || 'Tidak ada'}\n\nBerikan 3 rekomendasi kursus selanjutnya dalam JSON.`,
						},
					],
					max_tokens: 1024,
					temperature: 0.7,
					response_format: { type: 'json_object' },
				}),
			});

			if (aiRes.ok) {
				const aiData = await aiRes.json();
				const aiText = aiData.choices?.[0]?.message?.content || '{}';
				const aiRecs = JSON.parse(aiText);
				const recs = Array.isArray(aiRecs) ? aiRecs : (aiRecs.recommendations || []);
				const existingTitles = new Set(recommendations.map((r: any) => r.title.toLowerCase()));
				for (const rec of recs.slice(0, 3)) {
					if (!existingTitles.has((rec.title || '').toLowerCase())) {
						recommendations.push({
							id: null, title: rec.title, slug: null,
							short_description: rec.reason || '', icon: '📚',
							category: null, level: null, offering_id: null,
							offering_name: null, offering_status: null, ai_reason: rec.reason || '',
						});
					}
				}
			}
		} catch (aiErr) {
			console.error('AI recommendations failed:', aiErr);
		}
	}

	return jsonResponse({
		success: true,
		data: {
			recommendations,
			completed_count: (completedEnrollments || []).length,
			active_count: (activeEnrollments || []).length,
		},
	});
}

async function handleLessonRecommendations(db: any, userId: string): Promise<Response> {
	// Weak areas: assessment submissions with low score
	const { results: weakAssessments } = await db.prepare(
		`SELECT asub.id, asub.assessment_id, asub.score, asub.max_score, asub.feedback,
		        a.title AS assessment_title,
		        l.title AS lesson_title, l.slug AS lesson_slug, l.course_offering_id,
		        co.name AS offering_name, c.title AS course_title
		 FROM assessment_submissions asub
		 JOIN assessments a ON a.id = asub.assessment_id
		 LEFT JOIN content_blocks cb ON cb.source_id = a.lesson_id AND cb.type = 'lesson'
		 LEFT JOIN lessons l ON l.id = a.lesson_id
		 JOIN course_offerings co ON co.id = a.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 WHERE asub.user_id = ? AND asub.status = 'graded'
		   AND asub.score IS NOT NULL AND asub.max_score > 0
		   AND (asub.score * 1.0 / asub.max_score) < 0.7
		 ORDER BY (asub.score * 1.0 / asub.max_score) ASC
		 LIMIT 10`
	).bind(userId).all<any>();

	// Identify assessment_ids linked to lessons
	const assessIds = (weakAssessments?.results || []).map((a: any) => a.assessment_id).filter(Boolean);

	// Progress table has module_slug + session_id (slug-based), no lesson_id or score
	// Find skipped/incomplete lessons: lessons in active offerings with no progress row
	const { results: skippedLessons } = await db.prepare(
		`SELECT l.id, l.title, l.slug, l.course_offering_id, co.name AS offering_name,
		        c.title AS course_title
		 FROM lessons l
		 JOIN course_offerings co ON co.id = l.course_offering_id
		 JOIN courses c ON c.id = co.course_id
		 JOIN enrollments e ON e.course_offering_id = co.id AND e.user_id = ?
		 WHERE l.status = 'published' AND e.status = 'active'
		   AND NOT EXISTS (
		     SELECT 1 FROM progress p
		     WHERE p.user_id = ? AND p.session_id = l.slug AND p.module_slug = l.course_offering_id AND p.completed = 1
		   )
		 ORDER BY l.order_index ASC
		 LIMIT 5`
	).bind(userId, userId).all<any>();

	return jsonResponse({
		success: true,
		data: {
			weak_assessments: (weakAssessments?.results || []).map((a: any) => ({
				id: a.id,
				assessment_title: a.assessment_title,
				lesson_title: a.lesson_title,
				lesson_slug: a.lesson_slug,
				course_offering_id: a.course_offering_id,
				offering_name: a.offering_name,
				course_title: a.course_title,
				score: a.score,
				max_score: a.max_score,
				pct: a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0,
				feedback: a.feedback,
			})),
			skipped_lessons: (skippedLessons?.results || []).map((l: any) => ({
				title: l.title,
				slug: l.slug,
				course_offering_id: l.course_offering_id,
				offering_name: l.offering_name,
				course_title: l.course_title,
			})),
		},
	});
}

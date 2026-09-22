import { getDB } from '$lib/server/d1';
import { cachedDbFirst, cachedDbQuery } from '$lib/server/cache';

export async function load({ params, platform }: {
	params: Record<string, string>;
	platform: App.Platform;
}) {
	if (!platform) return { instructor: null, courses: [] };

	const db = getDB(platform);
	const instructorId = params.id;

	const instructor = await cachedDbFirst<any>(
		db,
		`SELECT id, display_name, avatar_url, bio, headline, website, social_links, email,
		        (SELECT COUNT(*) FROM course_offerings co WHERE co.instructor_id = users.id) AS course_count
		 FROM users WHERE id = ?`,
		[instructorId],
		300_000 // 5 minutes cache
	);

	if (!instructor) return { instructor: null, courses: [] };

	const { results: courses } = await cachedDbQuery<any>(
		db,
		`SELECT co.id AS offering_id, co.name, co.status, co.start_date,
		        c.title AS course_title, c.icon AS course_icon, c.slug AS course_slug,
		        c.level, c.category, c.short_description,
		        (SELECT COUNT(*) FROM enrollments e WHERE e.course_offering_id = co.id AND e.status = 'active') AS enrolled_count,
		        (SELECT AVG(rating) FROM course_reviews cr WHERE cr.course_offering_id = co.id) AS avg_rating,
		        (SELECT COUNT(*) FROM course_reviews cr2 WHERE cr2.course_offering_id = co.id) AS rating_count
		 FROM course_offerings co
		 JOIN courses c ON c.id = co.course_id
		 WHERE co.instructor_id = ? AND co.status = 'active'
		 ORDER BY co.created_at DESC`,
		[instructorId],
		300_000
	);

	return {
		instructor: {
			id: instructor.id,
			name: instructor.display_name,
			avatarUrl: instructor.avatar_url || '',
			bio: instructor.bio || '',
			headline: instructor.headline || '',
			website: instructor.website || '',
			socialLinks: instructor.social_links || '{}',
			courseCount: instructor.course_count || 0,
		},
		courses: (courses || []).map((c: any) => ({
			offeringId: c.offering_id,
			name: c.name,
			status: c.status,
			startDate: c.start_date,
			courseTitle: c.course_title,
			icon: c.course_icon || '📚',
			slug: c.course_slug,
			level: c.level,
			category: c.category,
			shortDescription: c.short_description,
			enrolledCount: c.enrolled_count || 0,
			avgRating: c.avg_rating ? Math.round(c.avg_rating * 10) / 10 : null,
			ratingCount: c.rating_count || 0,
		})),
	};
}

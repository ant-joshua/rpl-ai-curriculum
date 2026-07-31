import type { PageServerLoad } from './$types';
import { getTokenFromRequest, getSession } from '$lib/server/auth';
import { getDB } from '$lib/server/d1';
import { cachedDbQuery } from '$lib/server/cache';

export const load: PageServerLoad = async ({ request, platform }) => {
  const db = getDB(platform);
  const token = getTokenFromRequest(request);
  if (!token) return { courses: [] };

  const session = await getSession(platform, token);
  if (!session) return { courses: [] };

  const userId = session.user.id;

  const { results: courses } = await cachedDbQuery<any>(
    db,
    `SELECT 
      e.course_offering_id AS offeringId,
      co.name,
      COALESCE(c.title, co.name) AS title,
      COALESCE(c.icon, 'book') AS icon
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.course_offering_id
    LEFT JOIN courses c ON c.id = co.course_id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC`,
    [userId]
  );

  return { courses: courses || [] };
};

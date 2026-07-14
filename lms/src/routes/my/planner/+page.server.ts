import { redirect } from '@sveltejs/kit';
import { getDB } from '$lib/server/d1';
import { getSession, getBearerToken } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, platform, url }) => {
  if (!platform) throw redirect(302, '/?error=no-platform');

  const token = getBearerToken(request) || url.searchParams.get('token');
  if (!token) throw redirect(302, '/login?redirect=/my/planner');

  const session = await getSession(platform, token);
  if (!session) throw redirect(302, '/login?redirect=/my/planner');

  const userId = session.user.id;
  const db = getDB(platform);

  // Fetch active enrollments with course info
  const { results: enrollments } = await db.prepare(
    `SELECT e.course_offering_id AS offering_id, co.name AS offering_name,
            c.id AS course_id, c.title AS course_title, c.icon AS course_icon
     FROM enrollments e
     JOIN course_offerings co ON co.id = e.course_offering_id
     JOIN courses c ON c.id = co.course_id
     WHERE e.user_id = ? AND e.status = 'active'
     ORDER BY e.enrolled_at DESC`
  ).bind(userId).all<any>();

  return {
    enrollments: enrollments || [],
    token,
  };
};

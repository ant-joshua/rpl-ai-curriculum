import type { PageServerLoad } from './$types';
import { CourseService } from '$lib/features/courses/server';
import { getTokenFromRequest, getSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ request, platform, locals }) => {
  if (!platform) {
    return { courses: [] };
  }

  let userId = locals?.user?.id;

  if (!userId) {
    const token = getTokenFromRequest(request);
    if (token) {
      const session = await getSession(platform, token);
      if (session) {
        userId = session.user.id;
      }
    }
  }

  if (!userId) {
    return { courses: [] };
  }

  const courseService = new CourseService(platform);
  const enrolled = await courseService.getUserEnrolledCoursesWithProgress(userId);

  return {
    courses: (enrolled || []).map(item => ({
      offeringId: item.offeringId,
      name: item.offeringName,
      title: item.course.title || item.offeringName,
      icon: item.course.icon || 'book',
      progress: item.progress.percentage,
    }))
  };
};

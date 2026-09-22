import { CourseService } from '$lib/services/course.service';
import { authenticateRequest, apiOk, apiError } from '$lib/server/api';

export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
  try {
    const auth = await authenticateRequest(locals, request, platform);
    if (auth.response) return auth.response;

    const courseService = new CourseService(platform);
    const courses = await courseService.getUserEnrolledCoursesWithProgress(auth.user.id);

    return apiOk(courses);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

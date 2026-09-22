import { ProgressService } from '$lib/services/progress.service';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

export async function POST({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const parsed = await parseJson<{ lessonSlug?: string; courseOfferingId?: string; completed?: boolean; timeSpent?: number }>(request);
		if (parsed.response) return parsed.response;

		const body = parsed.data || {};
		if (!body.lessonSlug || !body.courseOfferingId || body.completed === undefined) {
			return apiError('lessonSlug, courseOfferingId, and completed are required', 400);
		}

		const progressService = new ProgressService(platform);
		await progressService.recordProgress({
			userId: auth.user.id,
			courseOfferingId: body.courseOfferingId,
			lessonSlug: body.lessonSlug,
			completed: body.completed,
			timeSpent: body.timeSpent ?? 0
		});

		return apiOk({ updated: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const url = new URL(request.url);
		const offeringId = url.searchParams.get('offeringId');

		if (!offeringId) {
			return apiError('offeringId query parameter required', 400);
		}

		const progressService = new ProgressService(platform);
		const results = await progressService.getOfferingProgress(auth.user.id, offeringId);

		return apiOk(results);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

import { UserService } from '$lib/services/user.service';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

/**
 * GET /api/my/profile
 * Returns current user profile: id, displayName, email, avatarUrl, role, createdAt
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userService = new UserService(platform);
		const profile = await userService.getProfile(auth.user.id);

		if (!profile) {
			return apiError('Profile not found', 404);
		}

		return apiOk(profile);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

/**
 * PUT /api/my/profile
 * Update display_name and avatar_url for current user.
 */
export async function PUT({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const parsed = await parseJson<any>(request);
		if (parsed.response) return parsed.response;

		const { displayName, avatarUrl, bio, headline, website, socialLinks } = parsed.data || {};
		const userService = new UserService(platform);

		const updated = await userService.updateProfile(auth.user.id, {
			displayName,
			avatarUrl,
			bio,
			headline,
			website,
			socialLinks: typeof socialLinks === 'string' ? socialLinks : (socialLinks ? JSON.stringify(socialLinks) : undefined)
		});

		if (!updated) {
			return apiError('Failed to update profile', 400);
		}

		return apiOk(updated);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

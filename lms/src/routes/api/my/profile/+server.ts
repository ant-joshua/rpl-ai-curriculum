import { getDB } from '$lib/server/d1';
import { authenticateRequest, apiOk, apiError, parseJson } from '$lib/server/api';

/**
 * GET /api/my/profile
 * Returns current user profile: id, displayName, email, avatarUrl, role, createdAt
 */
export async function GET({ request, platform, locals }: { request: Request; platform: App.Platform; locals: App.Locals }): Promise<Response> {
	try {
		const auth = await authenticateRequest(locals, request, platform);
		if (auth.response) return auth.response;

		const userId = auth.user.id;
		const db = getDB(platform);

		// Get profile from users table (joins with oauth_users for email)
		const profile = await db.prepare(
			`SELECT u.id, u.display_name, u.avatar_url, u.role, u.created_at,
			        ou.email, ou.name AS oauth_name
			 FROM users u
			 LEFT JOIN oauth_users ou ON ou.id = u.id
			 WHERE u.id = ?`
		).bind(userId).first<any>();

		if (!profile) {
			return apiError('Profile not found', 404);
		}

		return apiOk({
			id: profile.id,
			displayName: profile.display_name || profile.oauth_name || '',
			email: profile.email || '',
			avatarUrl: profile.avatar_url || '',
			role: profile.role || 'student',
			createdAt: profile.created_at || '',
		});
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

		const userId = auth.user.id;
		const parsed = await parseJson<any>(request);
		if (parsed.response) return parsed.response;

		const { displayName, avatarUrl, bio, headline, website, socialLinks } = parsed.data || {};
		const db = getDB(platform);

		// Build dynamic UPDATE — only set provided fields
		const updates: string[] = [];
		const values: any[] = [];

		if (displayName !== undefined) {
			updates.push('display_name = ?');
			values.push(String(displayName));
		}
		if (avatarUrl !== undefined) {
			updates.push('avatar_url = ?');
			values.push(String(avatarUrl));
		}
		if (bio !== undefined) {
			updates.push('bio = ?');
			values.push(String(bio));
		}
		if (headline !== undefined) {
			updates.push('headline = ?');
			values.push(String(headline));
		}
		if (website !== undefined) {
			updates.push('website = ?');
			values.push(String(website));
		}
		if (socialLinks !== undefined) {
			updates.push('social_links = ?');
			values.push(typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks));
		}

		if (updates.length === 0) {
			return apiError('No fields to update', 400);
		}

		updates.push('updated_at = datetime(?)');
		values.push(new Date().toISOString());
		values.push(userId);

		await db.prepare(
			`UPDATE users SET ${updates.join(', ')} WHERE id = ?`
		).bind(...values).run();

		// Return updated profile
		const profile = await db.prepare(
			`SELECT u.id, u.display_name, u.avatar_url, u.role, u.created_at,
			        ou.email, ou.name AS oauth_name
			 FROM users u
			 LEFT JOIN oauth_users ou ON ou.id = u.id
			 WHERE u.id = ?`
		).bind(userId).first<any>();

		return apiOk({
			id: profile.id,
			displayName: profile.display_name || profile.oauth_name || '',
			email: profile.email || '',
			avatarUrl: profile.avatar_url || '',
			role: profile.role || 'student',
			createdAt: profile.created_at || '',
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return apiError(msg, 500);
	}
}

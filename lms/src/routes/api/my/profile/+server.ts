import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';

/**
 * GET /api/my/profile
 * Returns current user profile: id, displayName, email, avatarUrl, role, createdAt
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
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
			return jsonResponse({ success: false, error: 'Profile not found' }, 404);
		}

		return jsonResponse({
			success: true,
			data: {
				id: profile.id,
				displayName: profile.display_name || profile.oauth_name || '',
				email: profile.email || '',
				avatarUrl: profile.avatar_url || '',
				role: profile.role || 'student',
				createdAt: profile.created_at || '',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

/**
 * PUT /api/my/profile
 * Update display_name and avatar_url for current user.
 */
export async function PUT({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized — Bearer token required' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Unauthorized — invalid or expired token' }, 401);
		}

		const userId = session.user.id;
		const db = getDB(platform);

		let body: any;
		try {
			body = await request.json();
		} catch {
			return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
		}

		const { displayName, avatarUrl } = body;

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

		if (updates.length === 0) {
			return jsonResponse({ success: false, error: 'No fields to update' }, 400);
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

		return jsonResponse({
			success: true,
			data: {
				id: profile.id,
				displayName: profile.display_name || profile.oauth_name || '',
				email: profile.email || '',
				avatarUrl: profile.avatar_url || '',
				role: profile.role || 'student',
				createdAt: profile.created_at || '',
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

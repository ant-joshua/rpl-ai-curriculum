import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/2fa/disable
 * Auth required. Body: { password }
 * Verifies password first, then clears totp_secret and sets totp_verified = 0.
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const token = getBearerToken(request);
		if (!token) {
			return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
		}

		const session = await getSession(platform, token);
		if (!session) {
			return jsonResponse({ success: false, error: 'Session expired or invalid' }, 401);
		}

		const user = session.user;
		const db = getDB(platform);

		let body: any;
		try {
			body = await request.json();
		} catch {
			return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
		}

		const { password } = body;
		if (!password) {
			return jsonResponse({ success: false, error: 'Password required to disable 2FA' }, 400);
		}

		// Fetch user to verify password
		const userRow = await db.prepare('SELECT password_hash FROM users WHERE id = ?')
			.bind(user.id)
			.first<any>();

		if (!userRow?.password_hash) {
			return jsonResponse({ success: false, error: 'Password-based account required to disable 2FA' }, 400);
		}

		const valid = await bcrypt.compare(password, userRow.password_hash);
		if (!valid) {
			return jsonResponse({ success: false, error: 'Invalid password' }, 401);
		}

		// Clear TOTP
		await db.prepare('UPDATE users SET totp_secret = NULL, totp_verified = 0 WHERE id = ?')
			.bind(user.id)
			.run();

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

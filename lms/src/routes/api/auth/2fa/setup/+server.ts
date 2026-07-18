import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { generateSecret, getOTPAuthURL } from '$lib/server/totp';

/**
 * GET /api/auth/2fa/setup
 * Auth required. Generates TOTP secret, stores it in DB (not yet verified).
 * Returns { secret, otpauth_url }
 */
export async function GET({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
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

		const secret = generateSecret();
		const otpauthUrl = getOTPAuthURL(secret, user.username || user.name || 'user');

		// Store secret, mark as not yet verified
		await db.prepare('UPDATE users SET totp_secret = ?, totp_verified = 0 WHERE id = ?')
			.bind(secret, user.id)
			.run();

		return jsonResponse({ success: true, secret, otpauth_url: otpauthUrl });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

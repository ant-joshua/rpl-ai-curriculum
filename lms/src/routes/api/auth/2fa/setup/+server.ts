import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { generateSecret, getOTPAuthURL, generateRecoveryCodes, hashRecoveryCode } from '$lib/server/totp';

/**
 * GET /api/auth/2fa/setup
 * Auth required. Generates TOTP secret + recovery codes, stores both in DB.
 * Returns { secret, otpauth_url, recovery_codes } (plaintext codes shown once).
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

		// Generate recovery codes
		const plainCodes = generateRecoveryCodes(8);
		const hashedCodes: string[] = await Promise.all(plainCodes.map(hashRecoveryCode));

		// Store secret and hashed recovery codes, mark as not yet verified
		await db.prepare(
			'UPDATE users SET totp_secret = ?, totp_verified = 0, recovery_codes = ?, used_recovery_codes = ? WHERE id = ?'
		).bind(secret, JSON.stringify(hashedCodes), '[]', user.id).run();

		return jsonResponse({
			success: true,
			secret,
			otpauth_url: otpauthUrl,
			recovery_codes: plainCodes, // displayed to user once
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { generateRecoveryCodes, hashRecoveryCode } from '$lib/server/totp';

/**
 * POST /api/auth/2fa/recovery-codes
 * Auth required. Regenerates recovery codes (invalidates old ones).
 * Returns { recovery_codes: string[] } (plaintext codes shown once).
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

		// Verify 2FA is enabled
		const userRow = await db.prepare('SELECT totp_verified FROM users WHERE id = ?')
			.bind(user.id)
			.first<any>();

		if (!userRow?.totp_verified) {
			return jsonResponse({ success: false, error: '2FA must be enabled to regenerate recovery codes' }, 400);
		}

		// Generate and hash new codes
		const plainCodes = generateRecoveryCodes(8);
		const hashedCodes: string[] = await Promise.all(plainCodes.map(hashRecoveryCode));

		// Replace stored codes
		await db.prepare(
			'UPDATE users SET recovery_codes = ?, used_recovery_codes = ? WHERE id = ?'
		).bind(JSON.stringify(hashedCodes), '[]', user.id).run();

		return jsonResponse({
			success: true,
			recovery_codes: plainCodes,
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

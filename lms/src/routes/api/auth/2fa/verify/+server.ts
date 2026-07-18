import { getDB, jsonResponse } from '$lib/server/d1';
import { getBearerToken, getSession } from '$lib/server/auth';
import { verifyTOTP } from '$lib/server/totp';
import { send2FAEnabledEmail } from '$lib/server/email';

/**
 * POST /api/auth/2fa/verify
 * Auth required. Body: { code }
 * Verifies TOTP against stored secret, marks totp_verified = 1 on success.
 * Sends email notification on successful enable.
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

		const { code } = body;
		if (!code || typeof code !== 'string') {
			return jsonResponse({ success: false, error: 'Verification code required' }, 400);
		}

		// Fetch stored secret
		const userRow = await db.prepare('SELECT totp_secret, email FROM users WHERE id = ?')
			.bind(user.id)
			.first<any>();

		if (!userRow?.totp_secret) {
			return jsonResponse({ success: false, error: 'TOTP not set up. Call /api/auth/2fa/setup first.' }, 400);
		}

		const valid = await verifyTOTP(userRow.totp_secret, code);
		if (!valid) {
			return jsonResponse({ success: false, error: 'Invalid verification code' }, 400);
		}

		await db.prepare('UPDATE users SET totp_verified = 1 WHERE id = ?')
			.bind(user.id)
			.run();

		// Send email notification (fire-and-forget)
		const userEmail = userRow.email || user.email || '';
		send2FAEnabledEmail(userEmail).catch(() => {});

		return jsonResponse({ success: true });
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

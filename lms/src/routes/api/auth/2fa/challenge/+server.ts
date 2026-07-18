import { getDB, jsonResponse } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import { verifyTOTP } from '$lib/server/totp';

const TEMP_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * POST /api/auth/2fa/challenge
 * Body: { temp_token, code }
 * Verifies TOTP code against temp_token, issues full session on success.
 */
export async function POST({ request, platform }: { request: Request; platform: App.Platform }): Promise<Response> {
	try {
		const db = getDB(platform);

		let body: any;
		try {
			body = await request.json();
		} catch {
			return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
		}

		const { temp_token, code } = body;
		if (!temp_token || !code) {
			return jsonResponse({ success: false, error: 'temp_token and code required' }, 400);
		}

		// Look up temp session
		const tempSession = await db.prepare(
			'SELECT * FROM temp_sessions WHERE id = ?'
		).bind(temp_token).first<any>();

		if (!tempSession) {
			return jsonResponse({ success: false, error: 'Invalid or expired temp_token' }, 401);
		}

		// Check expiry (5 min)
		const createdAt = new Date(tempSession.created_at + 'Z').getTime();
		if (Date.now() - createdAt > TEMP_SESSION_TTL_MS) {
			await db.prepare('DELETE FROM temp_sessions WHERE id = ?').bind(temp_token).run();
			return jsonResponse({ success: false, error: 'temp_token expired' }, 401);
		}

		const userId = tempSession.user_id;

		// Fetch user's TOTP secret
		const user = await db.prepare('SELECT * FROM users WHERE id = ?')
			.bind(userId)
			.first<any>();

		if (!user?.totp_verified || !user?.totp_secret) {
			await db.prepare('DELETE FROM temp_sessions WHERE id = ?').bind(temp_token).run();
			return jsonResponse({ success: false, error: 'TOTP not enabled for this user' }, 400);
		}

		const valid = await verifyTOTP(user.totp_secret, code);
		if (!valid) {
			return jsonResponse({ success: false, error: 'Invalid verification code' }, 401);
		}

		// Issue full session
		const sessionToken = await createSession(platform, userId, 'password');

		// Delete temp session (single-use)
		await db.prepare('DELETE FROM temp_sessions WHERE id = ?').bind(temp_token).run();

		return jsonResponse({
			success: true,
			token: sessionToken,
			user: {
				id: user.id,
				username: user.username,
				display_name: user.display_name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		return jsonResponse({ success: false, error: msg }, 500);
	}
}

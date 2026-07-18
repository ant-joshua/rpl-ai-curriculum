import { getDB, jsonResponse } from '$lib/server/d1';
import { createSession } from '$lib/server/auth';
import { verifyTOTP, hashRecoveryCode } from '$lib/server/totp';

const TEMP_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Per-temp_token rate limiting: 5 attempts per 5 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(key: string): { allowed: boolean; retryAfter: number } {
	const now = Date.now();
	const entry = rateLimitMap.get(key);
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return { allowed: true, retryAfter: 0 };
	}
	entry.count++;
	if (entry.count > RATE_LIMIT_MAX) {
		const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
		return { allowed: false, retryAfter };
	}
	return { allowed: true, retryAfter: 0 };
}

// Clean stale entries every 60s
let lastCleanup = Date.now();
function cleanupRateLimits(): void {
	if (Date.now() - lastCleanup < 60_000) return;
	lastCleanup = Date.now();
	const now = Date.now();
	for (const [key, entry] of rateLimitMap) {
		if (now > entry.resetAt) rateLimitMap.delete(key);
	}
}

/**
 * POST /api/auth/2fa/challenge
 * Body: { temp_token, code }
 * Verifies TOTP code or recovery code against temp_token, issues full session on success.
 * Rate-limited: 5 attempts per temp_token per 5 minutes.
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

		// Rate limit by temp_token
		cleanupRateLimits();
		const rl = checkRateLimit(temp_token);
		if (!rl.allowed) {
			return new Response(JSON.stringify({ success: false, error: 'Too many attempts. Try again later.' }), {
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': String(rl.retryAfter),
				},
			});
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

		// Fetch user's TOTP secret and recovery codes
		const user = await db.prepare('SELECT * FROM users WHERE id = ?')
			.bind(userId)
			.first<any>();

		if (!user?.totp_verified || !user?.totp_secret) {
			await db.prepare('DELETE FROM temp_sessions WHERE id = ?').bind(temp_token).run();
			return jsonResponse({ success: false, error: 'TOTP not enabled for this user' }, 400);
		}

		// Try TOTP first
		const validTOTP = await verifyTOTP(user.totp_secret, code);
		let valid = validTOTP;

		// If TOTP fails, try recovery codes
		if (!valid && user.recovery_codes) {
			const hashedInput = await hashRecoveryCode(code);
			const storedHashes: string[] = JSON.parse(user.recovery_codes || '[]');
			const usedHashes: string[] = JSON.parse(user.used_recovery_codes || '[]');
			const idx = storedHashes.findIndex((h: string) => h === hashedInput && !usedHashes.includes(h));
			if (idx !== -1) {
				// Mark this code as used
				usedHashes.push(hashedInput);
				await db.prepare('UPDATE users SET used_recovery_codes = ? WHERE id = ?')
					.bind(JSON.stringify(usedHashes), userId).run();
				valid = true;
			}
		}

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

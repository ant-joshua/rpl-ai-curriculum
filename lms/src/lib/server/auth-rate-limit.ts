/**
 * Per-endpoint in-memory rate limiter for auth endpoints.
 *
 * Stricter than the generic rateLimit() — protects login/register/forgot
 * from brute-force while allowing normal traffic.
 * State resets on worker restart — acceptable for CF serverless.
 */

interface AuthRateLimitEntry {
	count: number;
	windowStart: number;
}

const AUTH_WINDOW_MS = 60 * 1000; // 1 minute
const AUTH_MAX = 10; // max attempts per IP per minute

const authHits = new Map<string, AuthRateLimitEntry>();

function cleanup(): void {
	const now = Date.now();
	for (const [key, entry] of authHits) {
		if (now - entry.windowStart > AUTH_WINDOW_MS) {
			authHits.delete(key);
		}
	}
}

/**
 * Stricter rate limiter for auth endpoints.
 * Returns { allowed: true } or { allowed: false, retryAfter: N }.
 */
export function authRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
	cleanup();

	const now = Date.now();
	const entry = authHits.get(ip);

	if (!entry || now - entry.windowStart > AUTH_WINDOW_MS) {
		authHits.set(ip, { count: 1, windowStart: now });
		return { allowed: true, retryAfter: 0 };
	}

	entry.count++;

	if (entry.count > AUTH_MAX) {
		const elapsed = now - entry.windowStart;
		const retryAfter = Math.ceil((AUTH_WINDOW_MS - elapsed) / 1000);
		return { allowed: false, retryAfter };
	}

	return { allowed: true, retryAfter: 0 };
}

/**
 * Get client IP from request — checks CF-Connecting-IP first, falls back to x-forwarded-for.
 */
export function getClientIp(request: Request): string {
	const cfIp = request.headers.get('cf-connecting-ip');
	if (cfIp) return cfIp;
	const fwd = request.headers.get('x-forwarded-for');
	if (fwd) return fwd.split(',')[0].trim();
	return 'unknown';
}

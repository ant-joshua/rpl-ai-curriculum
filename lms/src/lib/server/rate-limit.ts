/**
 * Simple in-memory rate limiter.
 *
 * Tracks requests per IP per time window (100 req/min by default).
 * State resets on worker restart — acceptable for CF serverless.
 * Stale entries are cleaned up lazily every 30 seconds.
 */

interface RateLimitEntry {
	count: number;
	windowStart: number;
}

interface RateLimitResult {
	allowed: boolean;
	retryAfter: number; // seconds until next allowed request
}

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max requests per window per IP

const hits = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanup(): void {
	const now = Date.now();
	// Only clean up every 30 seconds to avoid perf overhead
	if (now - lastCleanup < 30_000) return;
	lastCleanup = now;
	for (const [key, entry] of hits) {
		if (now - entry.windowStart > WINDOW_MS) {
			hits.delete(key);
		}
	}
}

/**
 * Check if an IP is allowed to make a request.
 * Returns { allowed: true } or { allowed: false, retryAfter: N }.
 */
export function rateLimit(ip: string): RateLimitResult {
	cleanup();

	const now = Date.now();
	const entry = hits.get(ip);

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		// Start new window
		hits.set(ip, { count: 1, windowStart: now });
		return { allowed: true, retryAfter: 0 };
	}

	entry.count++;

	if (entry.count > MAX_REQUESTS) {
		const elapsed = now - entry.windowStart;
		const retryAfter = Math.ceil((WINDOW_MS - elapsed) / 1000);
		return { allowed: false, retryAfter };
	}

	return { allowed: true, retryAfter: 0 };
}

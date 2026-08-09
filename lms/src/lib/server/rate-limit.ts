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
const MAX_MUTATION_REQUESTS = 30; // stricter for POST/PATCH/DELETE

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
export function rateLimit(ip: string, maxRequests: number = MAX_REQUESTS): RateLimitResult {
	cleanup();

	const now = Date.now();
	const entry = hits.get(ip);

	if (!entry || now - entry.windowStart > WINDOW_MS) {
		// Start new window
		hits.set(ip, { count: 1, windowStart: now });
		return { allowed: true, retryAfter: 0 };
	}

	entry.count++;

	if (entry.count > maxRequests) {
		const elapsed = now - entry.windowStart;
		const retryAfter = Math.ceil((WINDOW_MS - elapsed) / 1000);
		return { allowed: false, retryAfter };
	}

	return { allowed: true, retryAfter: 0 };
}

/**
 * Resolve client IP from a request. Prefers Cloudflare header,
 * falls back to cf-connecting-ip / x-forwarded-for.
 */
export function getClientIp(request: Request): string {
	const cf = request.headers.get('cf-connecting-ip');
	if (cf) return cf;
	const fwd = request.headers.get('x-forwarded-for');
	if (fwd) return fwd.split(',')[0].trim();
	return 'unknown';
}

/**
 * Standard 429 response body.
 */
export function rateLimitResponse(retryAfter: number): Response {
	return new Response(JSON.stringify({
		success: false,
		error: 'Too many requests. Please try again later.',
		retryAfter,
	}), {
		status: 429,
		headers: {
			'Content-Type': 'application/json',
			'Retry-After': String(retryAfter),
		},
	});
}

/**
 * Wrap a handler with per-IP rate limiting for mutation endpoints.
 * Applies stricter limit for non-GET methods.
 */
export function withRateLimit(
	handler: (request: Request, ...rest: unknown[]) => Promise<Response>,
	maxRequests?: number,
): (request: Request, ...rest: unknown[]) => Promise<Response> {
	return async (request, ...rest) => {
		const ip = getClientIp(request);
		const method = request.method;
		const limit = maxRequests ?? (method !== 'GET' ? MAX_MUTATION_REQUESTS : MAX_REQUESTS);
		const result = rateLimit(ip, limit);
		if (!result.allowed) {
			return rateLimitResponse(result.retryAfter);
		}
		return handler(request, ...rest);
	};
}

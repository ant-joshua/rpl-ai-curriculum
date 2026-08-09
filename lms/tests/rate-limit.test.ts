import { describe, it, expect } from 'vitest';
import { rateLimit } from '../src/lib/server/rate-limit';

// Test the rate limiter logic (pure function, no DB)
describe('rate-limit', () => {
	it('allows first request', () => {
		const result = rateLimit('127.0.0.1', 100);
		expect(result.allowed).toBe(true);
	});

	it('blocks after limit exceeded', () => {
		const ip = '10.0.0.1';
		// Fill up the window
		for (let i = 0; i < 100; i++) {
			rateLimit(ip, 100);
		}
		const result = rateLimit(ip, 100);
		expect(result.allowed).toBe(false);
		expect(result.retryAfter).toBeGreaterThan(0);
	});

	it('mutation limit stricter', () => {
		const ip = '10.0.0.2';
		for (let i = 0; i < 30; i++) {
			rateLimit(ip, 30);
		}
		const result = rateLimit(ip, 30);
		expect(result.allowed).toBe(false);
	});
});
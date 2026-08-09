import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../src/lib/server/rate-limit.ts';

// Test the rate limiter logic (pure function, no DB)
describe('rate-limit', () => {
	test('allows first request', () => {
		// Import dynamically since it uses ESM
		// Rate limiter state is module-level, test via direct logic
		const result = rateLimit('127.0.0.1', 100);
		assert.equal(result.allowed, true);
	});

	test('blocks after limit exceeded', () => {
		const ip = '10.0.0.1';
		// Fill up the window
		for (let i = 0; i < 100; i++) {
			rateLimit(ip, 100);
		}
		const result = rateLimit(ip, 100);
		assert.equal(result.allowed, false);
		assert.ok(result.retryAfter > 0);
	});

	test('mutation limit stricter', () => {
		const ip = '10.0.0.2';
		for (let i = 0; i < 30; i++) {
			rateLimit(ip, 30);
		}
		const result = rateLimit(ip, 30);
		assert.equal(result.allowed, false);
	});
});

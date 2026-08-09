import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.SMOKE_BASE_URL || 'https://rpl-ai-curriculum.pages.dev';

// Skip gracefully when offline / no network
async function get(path: string, headers: Record<string, string> = {}) {
	try {
		const res = await fetch(`${BASE}${path}`, { headers, redirect: 'manual' });
		return { status: res.status, body: await res.text() };
	} catch (e) {
		return { status: 0, body: String(e) };
	}
}

describe('API smoke — public endpoints', () => {
	test('GET /api/health returns 200', async () => {
		const { status } = await get('/api/health');
		assert.equal(status, 200);
	});

	test('GET /api/modules returns JSON', async () => {
		const { status, body } = await get('/api/modules');
		assert.equal(status, 200);
		const data = JSON.parse(body);
		assert.ok(Array.isArray(data.modules) || Array.isArray(data));
	});

	test('login rejects bad password', async () => {
		const res = await fetch(`${BASE}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'guru1@school.com', password: 'wrong-password' }),
		});
		const data = await res.json();
		assert.equal(res.status, 401);
		assert.equal(data.success, false);
	});

	test('login succeeds with fallback password', async () => {
		const res = await fetch(`${BASE}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: 'guru1@school.com', password: 'password123' }),
		});
		const data = await res.json();
		assert.equal(res.status, 200);
		assert.equal(data.success, true);
		assert.ok(data.token || data.sessionToken || data.user);
	});
});

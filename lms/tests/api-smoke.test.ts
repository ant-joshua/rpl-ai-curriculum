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

describe('API smoke — register + direct messages', () => {
	const email = `smoke${Date.now()}@test.dev`;
	let token = '';

	test('register creates a new student', async () => {
		const res = await fetch(`${BASE}/api/auth/register/student`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Smoke Test', email, password: 'password123' }),
		});
		const data = await res.json();
		assert.equal(res.status, 200);
		assert.equal(data.success, true);
	});

	test('new user can login', async () => {
		const res = await fetch(`${BASE}/api/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username: email, password: 'password123' }),
		});
		const data = await res.json();
		assert.equal(res.status, 200);
		assert.ok(data.token);
		token = data.token;
	});

	test('conversations endpoint requires auth', async () => {
		const { status } = await get('/api/direct/conversations');
		assert.equal(status, 401);
	});

	test('conversations endpoint returns list for authed user', async () => {
		const res = await fetch(`${BASE}/api/direct/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		assert.equal(res.status, 200);
		const data = await res.json();
		assert.equal(data.success, true);
		assert.ok(Array.isArray(data.data));
	});

	test('send direct message to teacher', async () => {
		const res = await fetch(`${BASE}/api/direct/conversations/21f2215633f242b7b9314dc78d2562d3`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify({ content: 'halo bu, dari smoke test' }),
		});
		const data = await res.json();
		assert.equal(res.status, 201);
		assert.equal(data.success, true);
	});

	test('conversation appears in list after sending', async () => {
		const res = await fetch(`${BASE}/api/direct/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		const convs = data.data as Array<{ partner_id: string }>;
		assert.ok(convs.some((c) => c.partner_id === '21f2215633f242b7b9314dc78d2562d3'));
	});
});

import { describe, it, expect } from 'vitest';

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

// Mutation requests — the global rate limiter (30/min/IP) can 429 during
// full-suite runs. Retry with a short backoff like a real client would.

async function postJson(path: string, body: unknown, headers: Record<string, string> = {}): Promise<Response> {
	for (let attempt = 0; attempt < 3; attempt++) {
		const res = await fetch(`${BASE}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(body),
		});
		if (res.status !== 429 || attempt === 2) return res;
		await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
	}
	throw new Error('unreachable');
}
async function mutation(path: string, body: unknown, token: string): Promise<Response> {
	for (let attempt = 0; attempt < 3; attempt++) {
		const res = await fetch(`${BASE}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify(body),
		});
		if (res.status !== 429 || attempt === 2) return res;
		await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
	}
	throw new Error('unreachable');
}

describe('API smoke — public endpoints', () => {
	it('GET /api/health returns 200', async () => {
		const { status } = await get('/api/health');
		expect(status).toBe(200);
	});

	it('GET /api/modules returns JSON', async () => {
		const { status, body } = await get('/api/modules');
		expect(status).toBe(200);
		const data = JSON.parse(body);
		expect(Array.isArray(data.modules) || Array.isArray(data)).toBeTruthy();
	});

	it('login rejects bad password', async () => {
		const res = await postJson('/api/auth/login', { username: 'guru1@school.com', password: 'wrong-password' });
		const data = await res.json();
		expect(res.status).toBe(401);
		expect(data.success).toBe(false);
	});

	it('login succeeds with fallback password', async () => {
		const res = await postJson('/api/auth/login', { username: 'guru1@school.com', password: 'password123' });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.token || data.sessionToken || data.user).toBeTruthy();
	});
});

describe('API smoke — register + direct messages', () => {
	const email = `smoke${Date.now()}@test.dev`;
	let token = '';

	it('register creates a new student', async () => {
		const res = await postJson('/api/auth/register/student', { name: 'Smoke Test', email, password: 'password123' });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
	});

	it('new user can login', async () => {
		const res = await postJson('/api/auth/login', { username: email, password: 'password123' });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.token).toBeTruthy();
		token = data.token;
	});

	it('conversations endpoint requires auth', async () => {
		const { status } = await get('/api/direct/conversations');
		expect(status).toBe(401);
	});

	it('conversations endpoint returns list for authed user', async () => {
		const res = await fetch(`${BASE}/api/direct/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(Array.isArray(data.data)).toBeTruthy();
	});

	it('send direct message to teacher', async () => {
		const res = await mutation('/api/direct/conversations/21f2215633f242b7b9314dc78d2562d3', { content: 'halo bu, dari smoke test' }, token);
		const data = await res.json();
		expect(res.status).toBe(201);
		expect(data.success).toBe(true);
	});

	it('conversation appears in list after sending', async () => {
		const res = await fetch(`${BASE}/api/direct/conversations`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		const convs = data.data as Array<{ partner_id: string }>;
		expect(convs.some((c) => c.partner_id === '21f2215633f242b7b9314dc78d2562d3')).toBeTruthy();
	});

	it('unread-count endpoint returns count', async () => {
		const res = await fetch(`${BASE}/api/direct/unread-count`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(typeof data.unread).toBe('number');
	});

	it('notifications unread-count returns count', async () => {
		const res = await fetch(`${BASE}/api/notifications/unread-count`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(typeof data.unreadCount).toBe('number');
	});
});

describe('API smoke — instructor offerings', () => {
	const email = 'guru1@school.com';
	let token = '';

	it('instructor login', async () => {
		const res = await postJson('/api/auth/login', { username: email, password: 'password123' });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.token).toBeTruthy();
		token = data.token;
	});

	it('create course offering (self-paced, no class)', async () => {
		const res = await mutation('/api/instructor/courses', { name: `Smoke Course ${Date.now()}` }, token);
		const data = await res.json();
		expect(res.status).toBe(201);
		expect(data.success).toBe(true);
		expect(data.data?.id || data.id || data.offering_id || data.offering).toBeTruthy();
	});

	it('list offerings returns array', async () => {
		const res = await fetch(`${BASE}/api/instructor/courses`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(Array.isArray(data.offerings) || Array.isArray(data.data) || Array.isArray(data.courses)).toBeTruthy();
	});

	it('student cannot create offering (403)', async () => {
		const res = await postJson('/api/auth/login', { username: 'siswa1@school.com', password: 'password123' });
		const student = await res.json();
		expect(student.token).toBeTruthy();
		const r2 = await mutation('/api/instructor/courses', { name: 'Should Fail' }, student.token);
		expect(r2.status).toBe(403);
	});
});

describe('API smoke — study groups', () => {
	const email = 'guru1@school.com';
	let token = '';
	let groupId = '';

	it('instructor login', async () => {
		const res = await postJson('/api/auth/login', { username: email, password: 'password123' });
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.token).toBeTruthy();
		token = data.token;
	});

	it('create group', async () => {
		const res = await mutation('/api/groups', {
			name: `Smoke Group ${Date.now()}`,
			path_slug: `smoke-${Date.now()}`,
			description: 'auto-test',
		}, token);
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.data?.id).toBeTruthy();
		groupId = data.data?.id;
	});

	it('list groups includes created', async () => {
		const res = await fetch(`${BASE}/api/groups`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		expect(res.status).toBe(200);
		const groups = data.data as Array<{ id: string }>;
		expect(groups.some((g) => g.id === groupId)).toBeTruthy();
	});

	it('get group detail', async () => {
		const res = await fetch(`${BASE}/api/groups/${groupId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
		expect(data.data?.id || data.id).toBe(groupId);
	});

	it('post message to group', async () => {
		const res = await mutation(`/api/groups/${groupId}/messages`, { content: 'halo group dari smoke' }, token);
		const data = await res.json();
		expect(res.status).toBe(200);
		expect(data.success).toBe(true);
	});

	it('messages list has the message', async () => {
		const res = await fetch(`${BASE}/api/groups/${groupId}/messages`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const data = await res.json();
		expect(res.status).toBe(200);
		const msgs = data.data || data.messages || [];
		expect(Array.isArray(msgs)).toBeTruthy();
		expect(msgs.some((m: { content: string }) => m.content?.includes('halo group'))).toBeTruthy();
	});

	it('delete group', async () => {
		const res = await fetch(`${BASE}/api/groups/${groupId}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(200);
		const data = await res.json();
		expect(data.success).toBe(true);
	});

	it('deleted group returns 404', async () => {
		const res = await fetch(`${BASE}/api/groups/${groupId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		expect(res.status).toBe(404);
	});
});

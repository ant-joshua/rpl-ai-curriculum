import { describe, it, expect, beforeEach } from 'vitest';
import { createSession, getSession, deleteSession, getOrCreateUsersRow } from '../src/lib/server/auth';
import { getClientIp, rateLimitResponse, withRateLimit } from '../src/lib/server/rate-limit';
import { clearQueryCache } from '../src/lib/server/cache';
import { logError } from '../src/lib/server/error-logger';
import { logActivity } from '../src/lib/server/analytics';

// --- Mock D1 DB ---
const rows = new Map<string, any[]>();
const insertLog: string[] = [];
const deleteLog: string[] = [];

function resetDb() {
	rows.clear();
	insertLog.length = 0;
	deleteLog.length = 0;
}

const mockDb = {
	prepare: (sql: string) => ({
		bind: (...params: any[]) => {
			// SELECT ... FROM sessions WHERE id = ? AND expires_at > ?
			const sessionMatch = sql.match(/SELECT \* FROM sessions WHERE id = \? AND expires_at > \?/);
			if (sessionMatch) {
				const [token, now] = params;
				const sess = (rows.get('sessions') || []).find((s) => s.id === token && s.expires_at > now);
				return { first: async () => sess || null };
			}
			const userMatch = sql.match(/SELECT \* FROM users WHERE id = \?/);
			if (userMatch) {
				const [id] = params;
				const u = (rows.get('users') || []).find((x) => x.id === id);
				return { first: async () => u || null };
			}
			const oauthMatch = sql.match(/SELECT \* FROM oauth_users WHERE id = \?/);
			if (oauthMatch) {
				const [id] = params;
				const u = (rows.get('oauth_users') || []).find((x) => x.id === id);
				return { first: async () => u || null };
			}
			const deleteSessionMatch = sql.match(/DELETE FROM sessions WHERE id = \?/);
			if (deleteSessionMatch) {
				return {
					run: async () => {
						deleteLog.push(params[0]);
						rows.set('sessions', (rows.get('sessions') || []).filter((s) => s.id !== params[0]));
						return { success: true };
					},
				};
			}
			const deleteExpired = sql.match(/DELETE FROM sessions WHERE expires_at < \?/);
			if (deleteExpired) {
				const [now] = params;
				rows.set('sessions', (rows.get('sessions') || []).filter((s) => s.expires_at >= now));
				return { run: async () => ({ success: true }) };
			}
			const insert = sql.match(/^INSERT INTO (\w+)/);
			if (insert) {
				const table = insert[1];
				const colNames = sql.match(/\(([^)]+)\)/)?.[1].split(',').map((c) => c.trim()) || [];
				return {
					run: async () => {
						const obj: any = {};
						colNames.forEach((c, i) => (obj[c] = params[i]));
						rows.set(table, [...(rows.get(table) || []), obj]);
						insertLog.push(table);
						return { success: true };
					},
					first: async () => null,
				};
			}
			return { run: async () => ({ success: true }), first: async () => null, all: async () => ({ results: [] }) };
		},
	}),
};

const mockPlatform = { env: { DB: mockDb } } as any;

beforeEach(() => {
	resetDb();
	clearQueryCache();
});

// --- createSession / getSession / deleteSession ---
describe('session lifecycle', () => {
	it('createSession inserts and returns token', async () => {
		const token = await createSession(mockPlatform, 'user-1', 'password');
		expect(token).toBeTruthy();
		expect(insertLog).toContain('sessions');
		const stored = rows.get('sessions') || [];
		expect(stored[0].user_id).toBe('user-1');
		expect(stored[0].provider).toBe('password');
	});

	it('getSession returns null for unknown token', async () => {
		await createSession(mockPlatform, 'user-1');
		const s = await getSession(mockPlatform, 'nope');
		expect(s).toBeNull();
	});

	it('getSession resolves user from users table', async () => {
		rows.set('users', [{ id: 'user-1', email: 'a@b.c' }]);
		const token = await createSession(mockPlatform, 'user-1');
		const s = await getSession(mockPlatform, token);
		expect(s?.user.email).toBe('a@b.c');
		expect(s?.session.user_id).toBe('user-1');
	});

	it('getSession falls back to oauth_users', async () => {
		rows.set('oauth_users', [{ id: 'oauth-1', email: 'o@a.c', name: 'OA' }]);
		const token = await createSession(mockPlatform, 'oauth-1', 'google');
		const s = await getSession(mockPlatform, token);
		expect(s?.user.email).toBe('o@a.c');
	});

	it('getSession deletes orphan session when user gone', async () => {
		const token = await createSession(mockPlatform, 'ghost-user');
		const s = await getSession(mockPlatform, token);
		expect(s).toBeNull();
		expect(deleteLog).toContain(token);
	});

	it('deleteSession removes token', async () => {
		const token = await createSession(mockPlatform, 'user-1');
		await deleteSession(mockPlatform, token);
		expect(deleteLog).toContain(token);
		const s = await getSession(mockPlatform, token);
		expect(s).toBeNull();
	});

	it('getOrCreateUsersRow returns existing user', async () => {
		rows.set('users', [{ id: 'u1', email: 'x@y.z' }]);
		const u = await getOrCreateUsersRow(mockPlatform, 'u1');
		expect(u.email).toBe('x@y.z');
		expect(insertLog).not.toContain('users');
	});

	it('getOrCreateUsersRow creates new student user', async () => {
		const u = await getOrCreateUsersRow(mockPlatform, 'u-new', 'jane@x.com', 'Jane');
		expect(u.id).toBe('u-new');
		expect(insertLog).toContain('users');
		expect(u.role).toBe('student');
		expect(u.username).toBe('jane');
	});
});

// --- getClientIp / rateLimitResponse / withRateLimit ---
describe('rate-limit helpers', () => {
	it('getClientIp prefers cf-connecting-ip', () => {
		const req = new Request('http://x', { headers: { 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' } });
		expect(getClientIp(req)).toBe('1.2.3.4');
	});

	it('getClientIp falls back to x-forwarded-for first entry', () => {
		const req = new Request('http://x', { headers: { 'x-forwarded-for': '5.6.7.8, 9.9.9.9' } });
		expect(getClientIp(req)).toBe('5.6.7.8');
	});

	it('getClientIp returns unknown when no headers', () => {
		expect(getClientIp(new Request('http://x'))).toBe('unknown');
	});

	it('rateLimitResponse returns 429 with Retry-After', () => {
		const res = rateLimitResponse(42);
		expect(res.status).toBe(429);
		expect(res.headers.get('Retry-After')).toBe('42');
	});

	it('withRateLimit blocks mutation over 30/min', async () => {
		const handler = async () => new Response('ok', { status: 200 });
		const wrapped = withRateLimit(handler);
		let blocked = 0;
		for (let i = 0; i < 35; i++) {
			const res = await wrapped(new Request('http://x', { method: 'POST', headers: { 'cf-connecting-ip': 'rl-test-1' } }));
			if (res.status === 429) blocked++;
		}
		expect(blocked).toBeGreaterThan(0);
	});

	it('withRateLimit allows GET up to 100/min', async () => {
		const handler = async () => new Response('ok', { status: 200 });
		const wrapped = withRateLimit(handler);
		let blocked = 0;
		for (let i = 0; i < 99; i++) {
			const res = await wrapped(new Request('http://x', { headers: { 'cf-connecting-ip': 'rl-test-2' } }));
			if (res.status === 429) blocked++;
		}
		expect(blocked).toBe(0);
	});
});

// --- logError / logActivity (best-effort, never throw) ---
describe('error logger & analytics', () => {
	it('logError with no platform is no-op', async () => {
		await expect(logError(null, { level: 'error', message: 'x' })).resolves.toBeUndefined();
	});

	it('logError inserts row', async () => {
		await logError(mockPlatform, { level: 'critical', message: 'boom', userId: 'u1', metadata: { a: 1 } });
		expect(insertLog).toContain('error_logs');
	});

	it('logError never throws on db failure', async () => {
		const bad = { env: { DB: { prepare: () => { throw new Error('db down'); } } } } as any;
		await expect(logError(bad, { level: 'error', message: 'x' })).resolves.toBeUndefined();
	});

	it('logActivity inserts row', async () => {
		await logActivity(mockPlatform, 'u1', 'login', 'session', 's1', { x: 1 }, { path: '/api/auth/login', method: 'POST', statusCode: 200 });
		expect(insertLog).toContain('user_activity_log');
	});

	it('logActivity never throws on db failure', async () => {
		const bad = { env: { DB: { prepare: () => { throw new Error('db down'); } } } } as any;
		await expect(logActivity(bad, 'u1', 'login')).resolves.toBeUndefined();
	});
});
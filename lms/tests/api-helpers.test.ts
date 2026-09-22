import { describe, it, expect } from 'vitest';
import { apiOk, apiError, requireAuth, requireRole, parseJson } from '../src/lib/server/api';

describe('API Server Helpers', () => {
	it('apiOk returns 200 with structured json', async () => {
		const res = apiOk({ name: 'test' }, { page: 1 });
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/json');
		const data = await res.json();
		expect(data).toEqual({
			success: true,
			data: { name: 'test' },
			meta: { page: 1 },
		});
	});

	it('apiError returns custom status and error string', async () => {
		const res = apiError('Not found', 404, { id: 123 });
		expect(res.status).toBe(404);
		const data = await res.json();
		expect(data).toEqual({
			success: false,
			error: 'Not found',
			details: { id: 123 },
		});
	});

	it('requireAuth rejects unauthenticated locals', async () => {
		const check = requireAuth({} as App.Locals);
		expect(check.response).toBeDefined();
		expect(check.response?.status).toBe(401);
		expect(check.user).toBeUndefined();
	});

	it('requireAuth passes with valid user', () => {
		const check = requireAuth({ user: { id: 'u1', role: 'student' } } as App.Locals);
		expect(check.response).toBeUndefined();
		expect(check.user?.id).toBe('u1');
	});

	it('requireRole rejects unauthorized role', async () => {
		const check = requireRole({ user: { id: 'u1', role: 'student' } } as App.Locals, ['admin', 'superadmin']);
		expect(check.response).toBeDefined();
		expect(check.response?.status).toBe(403);
	});

	it('requireRole passes with matching role', () => {
		const check = requireRole({ user: { id: 'u1', role: 'admin' } } as App.Locals, ['admin', 'superadmin']);
		expect(check.response).toBeUndefined();
		expect(check.user?.role).toBe('admin');
	});

	it('parseJson successfully parses valid request body', async () => {
		const req = new Request('https://api.test', {
			method: 'POST',
			body: JSON.stringify({ hello: 'world' }),
		});
		const result = await parseJson<{ hello: string }>(req);
		expect(result.data).toEqual({ hello: 'world' });
		expect(result.response).toBeUndefined();
	});

	it('parseJson returns 400 error on invalid JSON', async () => {
		const req = new Request('https://api.test', {
			method: 'POST',
			body: 'not a json',
		});
		const result = await parseJson(req);
		expect(result.data).toBeUndefined();
		expect(result.response?.status).toBe(400);
	});
});

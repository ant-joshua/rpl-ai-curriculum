import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

import { api, getDeviceId, getAuthToken } from '../src/lib/utils/api';

describe('Client API utility', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('api.get makes GET request with credentials include', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ success: true, data: [1, 2, 3] }),
		});
		globalThis.fetch = mockFetch;

		const res = await api.get('/api/test');
		expect(res.success).toBe(true);
		expect(res.data).toEqual([1, 2, 3]);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/test',
			expect.objectContaining({
				method: 'GET',
				credentials: 'include',
			})
		);
	});

	it('api.post sends JSON stringified body and headers', async () => {
		const mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			headers: new Headers({ 'content-type': 'application/json' }),
			json: async () => ({ success: true, data: { id: 'created' } }),
		});
		globalThis.fetch = mockFetch;

		const payload = { title: 'New Course' };
		const res = await api.post('/api/courses', payload);
		expect(res.success).toBe(true);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/courses',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify(payload),
				credentials: 'include',
			})
		);
	});

	it('api handles network errors gracefully', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network disconnected'));

		const res = await api.get('/api/offline');
		expect(res.success).toBe(false);
		expect(res.error).toBe('Network disconnected');
	});
});

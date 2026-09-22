import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

import { createQuery } from '../src/lib/composables/query.svelte';

describe('Svelte 5 createQuery composable', () => {
	it('initializes and executes fetcher', async () => {
		const mockFetcher = vi.fn().mockResolvedValue({ id: 1, name: 'Web Dev' });
		const q = createQuery(mockFetcher, { autoFetch: false });

		expect(q.data).toBeUndefined();
		expect(q.loading).toBe(false);

		await q.refetch();

		expect(q.data).toEqual({ id: 1, name: 'Web Dev' });
		expect(q.isSuccess).toBe(true);
		expect(q.isError).toBe(false);
		expect(mockFetcher).toHaveBeenCalledTimes(1);
	});

	it('handles error gracefully', async () => {
		const mockFetcher = vi.fn().mockRejectedValue(new Error('Network error'));
		const onError = vi.fn();
		const q = createQuery(mockFetcher, { autoFetch: false, onError });

		await q.refetch();

		expect(q.data).toBeUndefined();
		expect(q.error).toBe('Network error');
		expect(q.isError).toBe(true);
		expect(onError).toHaveBeenCalled();
	});

	it('supports mutate for optimistic updates', async () => {
		const q = createQuery(vi.fn(), { autoFetch: false, initialData: { count: 0 } });
		expect(q.data).toEqual({ count: 0 });

		q.mutate({ count: 5 });
		expect(q.data).toEqual({ count: 5 });

		q.mutate((prev) => ({ count: (prev?.count ?? 0) + 1 }));
		expect(q.data).toEqual({ count: 6 });
	});
});

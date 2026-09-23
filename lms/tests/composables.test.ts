import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/environment', () => ({
	browser: true,
}));

vi.mock('$lib/components/ui', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

vi.mock('$lib/utils/api', () => ({
	api: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
	getAuthToken: vi.fn(() => 'test-token'),
	getAuthHeaders: vi.fn(() => ({ 'Authorization': 'Bearer test-token', 'Content-Type': 'application/json' })),
}));

import { createMutation } from '../src/lib/composables/mutation.svelte';
import { useConfirmDialog } from '../src/lib/composables/confirm.svelte';
import { usePagination } from '../src/lib/composables/pagination.svelte';
import { useResource } from '../src/lib/composables/resource.svelte';
import { toast } from '$lib/components/ui';
import { api } from '$lib/utils/api';

describe('useConfirmDialog composable', () => {
	it('manages prompt and execution lifecycle', async () => {
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const dialog = useConfirmDialog<{ id: string; name: string }>({
			title: (item) => `Hapus ${item.name}`,
			onConfirm,
			successMessage: 'Berhasil dihapus',
		});

		expect(dialog.open).toBe(false);
		expect(dialog.target).toBeNull();

		dialog.ask({ id: '1', name: 'Item Alpha' });
		expect(dialog.open).toBe(true);
		expect(dialog.title).toBe('Hapus Item Alpha');

		await dialog.execute();

		expect(onConfirm).toHaveBeenCalledWith({ id: '1', name: 'Item Alpha' });
		expect(toast.success).toHaveBeenCalledWith('Berhasil dihapus');
		expect(dialog.open).toBe(false);
	});

	it('allows cancellation', () => {
		const dialog = useConfirmDialog<{ id: string }>();
		dialog.ask({ id: '123' });
		expect(dialog.open).toBe(true);
		dialog.cancel();
		expect(dialog.open).toBe(false);
	});
});

describe('createMutation composable', () => {
	it('handles successful mutation and toast', async () => {
		const mutationFn = vi.fn().mockResolvedValue({ id: 1, name: 'Saved' });
		const mutation = createMutation(mutationFn, {
			successToast: 'Data tersimpan',
		});

		expect(mutation.loading).toBe(false);
		const res = await mutation.mutate({ name: 'Test' });

		expect(res).toEqual({ id: 1, name: 'Saved' });
		expect(mutation.data).toEqual({ id: 1, name: 'Saved' });
		expect(mutation.isSuccess).toBe(true);
		expect(toast.success).toHaveBeenCalledWith('Data tersimpan');
	});

	it('handles failure mutation and error toast', async () => {
		const mutationFn = vi.fn().mockRejectedValue(new Error('Gagal simpan'));
		const mutation = createMutation(mutationFn, {
			errorToast: (err) => `Error: ${err.message}`,
		});

		const res = await mutation.mutate(undefined);

		expect(res).toBeUndefined();
		expect(mutation.isError).toBe(true);
		expect(mutation.error).toBe('Gagal simpan');
		expect(toast.error).toHaveBeenCalledWith('Error: Gagal simpan');
	});
});

describe('usePagination composable', () => {
	it('calculates totalPages and slices items', () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		const p = usePagination<number>({
			items: () => items,
			pageSize: 5,
		});

		expect(p.page).toBe(1);
		expect(p.totalItems).toBe(12);
		expect(p.totalPages).toBe(3);
		expect(p.paginatedItems).toEqual([1, 2, 3, 4, 5]);

		p.nextPage();
		expect(p.page).toBe(2);
		expect(p.paginatedItems).toEqual([6, 7, 8, 9, 10]);

		p.nextPage();
		expect(p.page).toBe(3);
		expect(p.paginatedItems).toEqual([11, 12]);

		p.nextPage(); // Should not overflow
		expect(p.page).toBe(3);

		p.prevPage();
		expect(p.page).toBe(2);
	});
});

describe('useResource CRUD composable', () => {
	it('loads items and manages CRUD operations', async () => {
		const mockData = [{ id: 'c1', name: 'Kupon Diskon' }];
		vi.mocked(api.get).mockResolvedValue({ success: true, data: mockData });
		vi.mocked(api.post).mockResolvedValue({ success: true, data: { id: 'c2', name: 'Baru' } });
		vi.mocked(api.delete).mockResolvedValue({ success: true });

		const resource = useResource({
			endpoint: '/api/admin/coupons',
			itemName: 'Kupon',
			autoLoad: false,
		});

		await resource.load();
		expect(resource.items).toEqual(mockData);

		resource.openCreate({ name: 'Baru' });
		expect(resource.modal).toEqual({ name: 'Baru' });

		const saved = await resource.save();
		expect(saved).toBe(true);
		expect(api.post).toHaveBeenCalled();
	});
});

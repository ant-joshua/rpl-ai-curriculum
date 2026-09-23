import { browser } from '$app/environment';
import { api } from '$lib/utils/api';
import { toast } from '$lib/components/ui';
import { useConfirmDialog } from './confirm.svelte';

export interface UseResourceOptions<T> {
	endpoint: string;
	idKey?: keyof T;
	itemName?: string;
	titleKey?: keyof T;
	autoLoad?: boolean;
	transform?: (raw: any) => T[];
	onLoaded?: (items: T[]) => void;
}

/**
 * High-level CRUD resource composable for backoffice management pages.
 * Handles data fetching, item creation/editing modal states, and deletion confirmation dialog.
 */
export function useResource<T extends Record<string, any>>(options: UseResourceOptions<T>) {
	const {
		endpoint,
		idKey = 'id' as keyof T,
		itemName = 'Item',
		titleKey = 'name' as keyof T,
		autoLoad = true,
		transform,
		onLoaded,
	} = options;

	let items = $state<T[]>([]);
	let loading = $state<boolean>(autoLoad && browser);
	let error = $state<string | null>(null);
	let modal = $state<Partial<T> | null>(null);
	let saving = $state<boolean>(false);

	async function load(): Promise<T[]> {
		if (!browser) return [];
		loading = true;
		error = null;
		try {
			const res = await api.get<any>(endpoint);
			if (res.success) {
				const raw = res.data ?? [];
				items = transform ? transform(raw) : Array.isArray(raw) ? raw : raw.items || [];
				onLoaded?.(items);
				return items;
			} else {
				throw new Error(res.error || `Gagal memuat ${itemName.toLowerCase()}`);
			}
		} catch (err: any) {
			const msg = err.message || `Gagal memuat ${itemName.toLowerCase()}`;
			error = msg;
			return [];
		} finally {
			loading = false;
		}
	}

	function openCreate(defaults: Partial<T> = {}) {
		modal = { ...defaults };
	}

	function openEdit(item: T) {
		modal = { ...item };
	}

	function closeModal() {
		modal = null;
	}

	async function save(payload?: Partial<T>): Promise<boolean> {
		const dataToSave = payload || modal;
		if (!dataToSave) return false;
		saving = true;
		try {
			const isEdit = Boolean(dataToSave[idKey]);
			const url = isEdit ? `${endpoint}/${dataToSave[idKey]}` : endpoint;
			const method = isEdit ? 'PUT' : 'POST';
			const res = await (method === 'PUT' ? api.put(url, dataToSave) : api.post(url, dataToSave));

			if (res.success) {
				toast.success(`${itemName} berhasil ${isEdit ? 'diperbarui' : 'dibuat'}`);
				closeModal();
				await load();
				return true;
			} else {
				toast.error(res.error || `Gagal menyimpan ${itemName.toLowerCase()}`);
				return false;
			}
		} catch (err: any) {
			toast.error(err.message || 'Gagal terhubung ke server');
			return false;
		} finally {
			saving = false;
		}
	}

	const deleteConfirm = useConfirmDialog<T>({
		title: (item) => `Hapus ${itemName}?`,
		message: (item) =>
			`Hapus ${itemName.toLowerCase()} "${item[titleKey] || item[idKey]}"? Tindakan ini tidak dapat dibatalkan.`,
		confirmText: `🗑️ Hapus ${itemName}`,
		variant: 'danger',
		onConfirm: async (item) => {
			const id = item[idKey];
			const res = await api.delete(`${endpoint}/${id}`);
			if (res.success) {
				items = items.filter((x) => x[idKey] !== id);
				toast.success(`${itemName} berhasil dihapus`);
			} else {
				throw new Error(res.error || `Gagal menghapus ${itemName.toLowerCase()}`);
			}
		},
	});

	if (autoLoad && browser) {
		load();
	}

	return {
		get items() {
			return items;
		},
		set items(val: T[]) {
			items = val;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		get modal() {
			return modal;
		},
		set modal(val: Partial<T> | null) {
			modal = val;
		},
		get saving() {
			return saving;
		},
		load,
		openCreate,
		openEdit,
		closeModal,
		save,
		deleteConfirm,
	};
}

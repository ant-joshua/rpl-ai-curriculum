export interface UsePaginationOptions<T> {
	initialPage?: number;
	pageSize?: number;
	items?: () => T[];
	totalItems?: () => number;
	onPageChange?: (page: number) => void;
}

/**
 * Lightweight Svelte 5 pagination composable.
 * Provides client-side slice calculation and reactive page management.
 */
export function usePagination<T = any>(options: UsePaginationOptions<T> = {}) {
	const { initialPage = 1, pageSize: initialPageSize = 10, items, totalItems, onPageChange } = options;

	let page = $state<number>(initialPage);
	let pageSize = $state<number>(initialPageSize);

	const total = $derived(
		totalItems ? totalItems() : items ? items().length : 0
	);

	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	const paginatedItems = $derived.by(() => {
		if (!items) return [];
		const list = items();
		const start = (page - 1) * pageSize;
		return list.slice(start, start + pageSize);
	});

	function setPage(p: number) {
		const next = Math.max(1, Math.min(p, totalPages));
		if (next !== page) {
			page = next;
			onPageChange?.(next);
		}
	}

	function nextPage() {
		if (page < totalPages) setPage(page + 1);
	}

	function prevPage() {
		if (page > 1) setPage(page - 1);
	}

	function setPageSize(size: number) {
		pageSize = size;
		if (page > totalPages) page = totalPages;
	}

	return {
		get page() {
			return page;
		},
		set page(v: number) {
			setPage(v);
		},
		get pageSize() {
			return pageSize;
		},
		set pageSize(v: number) {
			setPageSize(v);
		},
		get totalItems() {
			return total;
		},
		get totalPages() {
			return totalPages;
		},
		get paginatedItems() {
			return paginatedItems;
		},
		setPage,
		nextPage,
		prevPage,
		setPageSize,
	};
}

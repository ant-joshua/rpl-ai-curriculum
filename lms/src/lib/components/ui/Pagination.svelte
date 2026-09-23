<script lang="ts">
	let {
		page = $bindable(1),
		totalPages = 1,
		totalItems,
		pageSize,
		onchange,
		class: className = ''
	}: {
		page?: number;
		totalPages?: number;
		totalItems?: number;
		pageSize?: number;
		onchange?: (page: number) => void;
		class?: string;
	} = $props();

	function goToPage(p: number) {
		if (p < 1 || p > totalPages || p === page) return;
		page = p;
		onchange?.(p);
	}

	const visiblePages = $derived.by(() => {
		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}
		const pages: (number | string)[] = [];
		pages.push(1);

		if (page > 3) {
			pages.push('...');
		}

		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		if (page < totalPages - 2) {
			pages.push('...');
		}

		pages.push(totalPages);
		return pages;
	});

	const itemRange = $derived.by(() => {
		if (totalItems === undefined || pageSize === undefined || totalItems === 0) return null;
		const from = (page - 1) * pageSize + 1;
		const to = Math.min(page * pageSize, totalItems);
		return `${from}–${to} dari ${totalItems}`;
	});
</script>

{#if totalPages > 1 || itemRange}
	<div class="ui-pagination {className}">
		{#if itemRange}
			<span class="ui-pagination-info">Menampilkan {itemRange}</span>
		{/if}

		{#if totalPages > 1}
			<div class="ui-pagination-controls">
				<button
					type="button"
					class="ui-pagination-btn"
					disabled={page <= 1}
					onclick={() => goToPage(page - 1)}
					aria-label="Halaman sebelumnya"
				>
					‹ Prev
				</button>

				{#each visiblePages as p, i (i)}
					{#if p === '...'}
						<span class="ui-pagination-ellipsis">…</span>
					{:else}
						<button
							type="button"
							class="ui-pagination-btn ui-pagination-page"
							class:ui-pagination-page--active={page === p}
							onclick={() => goToPage(p as number)}
						>
							{p}
						</button>
					{/if}
				{/each}

				<button
					type="button"
					class="ui-pagination-btn"
					disabled={page >= totalPages}
					onclick={() => goToPage(page + 1)}
					aria-label="Halaman selanjutnya"
				>
					Next ›
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.ui-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 0;
		flex-wrap: wrap;
	}

	.ui-pagination-info {
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	.ui-pagination-controls {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.ui-pagination-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
		padding: 0 8px;
		font-size: 0.8125rem;
		font-weight: 500;
		font-family: inherit;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		border-radius: 6px;
		cursor: pointer;
		user-select: none;
		transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
	}

	.ui-pagination-btn:hover:not(:disabled) {
		background: var(--surface-alt);
		border-color: var(--border);
	}

	.ui-pagination-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.ui-pagination-page--active {
		background: var(--accent) !important;
		color: #ffffff !important;
		border-color: var(--accent) !important;
		font-weight: 600;
	}

	.ui-pagination-ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		font-size: 0.875rem;
		color: var(--text-secondary);
	}
</style>

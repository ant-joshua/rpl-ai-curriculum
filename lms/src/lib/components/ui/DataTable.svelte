<script lang="ts">
	import {
		createTable,
		FlexRender,
		stockFeatures,
		createCoreRowModel,
		createSortedRowModel,
		createFilteredRowModel,
		createPaginatedRowModel,
		type ColumnDef,
		type TableFeatures
	} from '@tanstack/svelte-table';

	let {
		columns = [],
		data = [],
		emptyMessage = 'Tidak ada data',
		emptyIcon = '',
		pageSize = 20,
		showPagination = true,
		showSearch = true,
		searchPlaceholder = 'Cari...',
		onRowClick,
		class: className = '',
		...rest
	}: {
		columns?: ColumnDef<any, any>[];
		data?: any[];
		emptyMessage?: string;
		emptyIcon?: string;
		pageSize?: number;
		showPagination?: boolean;
		showSearch?: boolean;
		searchPlaceholder?: string;
		onRowClick?: (row: any, index: number) => void;
		class?: string;
		[key: string]: unknown;
	} = $props();

	let sorting = $state<any[]>([]);
	let globalFilter = $state('');
	let pagination = $state({ pageIndex: 0, pageSize });

	const features: TableFeatures = {
		...stockFeatures
	};

	const table = createTable({
		features,
		get columns() { return columns; },
		get data() { return data; },
		state: {
			get sorting() { return sorting; },
			get globalFilter() { return globalFilter; },
			get pagination() { return pagination; }
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onGlobalFilterChange: (updater) => {
			globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		getCoreRowModel: createCoreRowModel(),
		getSortedRowModel: createSortedRowModel(),
		getFilteredRowModel: createFilteredRowModel(),
		getPaginationRowModel: createPaginatedRowModel(),
		initialState: {
			pagination: { pageIndex: 0, pageSize }
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="dt-wrapper {className}" {...rest}>
	{#if showSearch && data.length > 0}
		<div class="dt-search">
			<span class="dt-search-icon">🔍</span>
			<input
				type="text"
				placeholder={searchPlaceholder}
				value={globalFilter}
				oninput={(e) => { globalFilter = (e.target as HTMLInputElement).value; pagination = { ...pagination, pageIndex: 0 }; }}
				class="dt-search-input"
			/>
		</div>
	{/if}

	<div class="dt-scroll">
		<table class="dt-table">
			<thead>
				{#each table.getHeaderGroups() as headerGroup}
					<tr>
						{#each headerGroup.headers as header}
							<th
								class:sortable={header.column.getCanSort()}
								onclick={header.column.getToggleSortingHandler()}
							>
								{#if !header.isPlaceholder}
									<div class="th-inner">
										<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
										{#if header.column.getIsSorted() === 'asc'}
											<span class="sort-arrow">↑</span>
										{:else if header.column.getIsSorted() === 'desc'}
											<span class="sort-arrow">↓</span>
										{:else if header.column.getCanSort()}
											<span class="sort-arrow faded">↕</span>
										{/if}
									</div>
								{/if}
							</th>
						{/each}
					</tr>
				{/each}
			</thead>
			<tbody>
				{#if table.getRowModel().rows.length === 0}
					<tr>
						<td colspan={columns.length}>
							<div class="dt-empty">
								{#if emptyIcon}<span class="dt-empty-icon">{emptyIcon}</span>{/if}
								<p class="dt-empty-text">{emptyMessage}</p>
							</div>
						</td>
					</tr>
				{:else}
					{#each table.getRowModel().rows as row, i}
						<tr
							class:clickable={!!onRowClick}
							onclick={onRowClick ? () => onRowClick(row.original, i) : undefined}
						>
							{#each row.getVisibleCells() as cell}
								<td>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	{#if showPagination && table.getPageCount() > 1}
		<div class="dt-pagination">
			<span class="dt-page-info">
				Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
				· {table.getFilteredRowModel().rows.length} data
			</span>
			<div class="dt-page-controls">
				<button class="dt-page-btn" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>← Prev</button>
				<button class="dt-page-btn" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next →</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.dt-wrapper {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		overflow: hidden;
		font-family: var(--font-sans);
		font-feature-settings: 'cv01', 'ss03';
	}

	.dt-search {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.dt-search-icon { font-size: 14px; opacity: 0.5; }

	.dt-search-input {
		flex: 1;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 13px;
		color: #f7f8f8;
		font-family: inherit;
		font-feature-settings: 'cv01', 'ss03';
		outline: none;
		transition: border-color 0.15s;
	}

	.dt-search-input:focus {
		border-color: #5e6ad2;
		box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.15);
	}

	.dt-search-input::placeholder { color: #8a8f98; }

	.dt-scroll { overflow-x: auto; }

	.dt-table {
		width: 100%;
		border-collapse: collapse;
	}

	thead tr { background: rgba(255, 255, 255, 0.04); }

	th {
		text-align: left;
		font-size: 13px;
		font-weight: 510;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 10px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		white-space: nowrap;
		user-select: none;
	}

	th.sortable { cursor: pointer; transition: color 0.15s; }
	th.sortable:hover { color: #f7f8f8; }

	.th-inner { display: flex; align-items: center; gap: 4px; }
	.sort-arrow { font-size: 11px; color: #7170ff; }
	.sort-arrow.faded { color: #62666d; }

	td {
		font-size: 14px;
		color: #d0d6e0;
		padding: 12px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	tbody tr { transition: background 0.15s; }
	tbody tr:hover { background: rgba(255, 255, 255, 0.02); }
	tbody tr:last-child td { border-bottom: none; }
	tbody tr.clickable { cursor: pointer; }

	.dt-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 24px;
		text-align: center;
	}

	.dt-empty-icon { font-size: 32px; margin-bottom: 8px; opacity: 0.5; }
	.dt-empty-text { font-size: 14px; color: #8a8f98; margin: 0; }

	.dt-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.dt-page-info { font-size: 13px; color: #8a8f98; }
	.dt-page-controls { display: flex; gap: 6px; }

	.dt-page-btn {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		padding: 4px 12px;
		font-size: 13px;
		font-weight: 510;
		color: #d0d6e0;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s;
	}

	.dt-page-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.06);
		color: #f7f8f8;
	}

	.dt-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>

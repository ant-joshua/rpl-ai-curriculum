<script lang="ts">
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let logs: any[] = $state([]);
	let loading = $state(true);
	let page = $state(1);
	let totalPages = $state(1);
	let total = $state(0);
	let filterLevel = $state('');
	let filterSearch = $state('');
	let filterStartDate = $state('');
	let filterEndDate = $state('');

	const API = '/api/admin/error-logs';

	async function load() {
		loading = true;
		const params = new URLSearchParams({ page: String(page), limit: '50' });
		if (filterLevel) params.set('level', filterLevel);
		if (filterSearch) params.set('search', filterSearch);
		if (filterStartDate) params.set('startDate', filterStartDate);
		if (filterEndDate) params.set('endDate', filterEndDate);
		const res = await fetch(`${API}?${params}`);
		const data = await res.json();
		if (data.success) {
			logs = data.logs;
			totalPages = data.pagination.totalPages;
			total = data.pagination.total;
		}
		loading = false;
	}

	function prevPage() { if (page > 1) { page--; load(); } }
	function nextPage() { if (page < totalPages) { page++; load(); } }
	function applyFilter() { page = 1; load(); }
	function resetFilter() { filterLevel = ''; filterSearch = ''; filterStartDate = ''; filterEndDate = ''; page = 1; load(); }

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
	}

	function levelBadge(level: string) {
		const colors: Record<string, string> = {
			error: 'background:#ef4444;color:#fff',
			warning: 'background:#eab308;color:#fff',
			critical: 'background:#b91c1c;color:#fff',
		};
		return colors[level] || 'background:#6b7280;color:#fff';
	}

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Time',
			accessorKey: 'created_at',
			cell: ({ getValue }) => {
				const d = getValue() as string;
				return `<span style="font-size:12px;color:var(--text-secondary);white-space:nowrap">${formatDate(d)}</span>`;
			}
		},
		{
			header: 'Level',
			accessorKey: 'level',
			cell: ({ getValue }) => {
				const level = getValue() as string;
				return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;${levelBadge(level)}">${level}</span>`;
			}
		},
		{
			header: 'Message',
			accessorKey: 'message',
			cell: ({ getValue }) => {
				const msg = getValue() as string;
				return `<span style="font-size:12px;font-family:monospace;color:var(--text-primary);max-width:300px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(msg || '').replace(/"/g, '&quot;')}">${msg || '-'}</span>`;
			}
		},
		{
			header: 'URL',
			accessorKey: 'url',
			cell: ({ getValue }) => {
				const url = getValue() as string;
				return `<span style="font-size:12px;font-family:monospace;color:var(--text-secondary);max-width:200px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(url || '').replace(/"/g, '&quot;')}">${url || '-'}</span>`;
			}
		},
		{
			header: 'Method',
			accessorKey: 'method',
			cell: ({ getValue }) => {
				const m = getValue() as string;
				return `<span style="font-size:12px;font-family:monospace;color:var(--text-secondary)">${m || '-'}</span>`;
			}
		},
		{
			header: 'User',
			accessorKey: 'username',
			cell: ({ getValue, row }) => {
				const u = getValue() as string || row.original.user_name || row.original.user_id;
				return `<span style="font-size:12px;color:var(--text-secondary)">${u || '-'}</span>`;
			}
		},
		{
			header: 'Stack',
			accessorKey: 'stack',
			cell: ({ getValue }) => {
				const stack = getValue() as string;
				if (!stack) return '<span style="font-size:12px;color:var(--text-muted)">-</span>';
				return `<button onclick="navigator.clipboard.writeText(this.dataset.stack)" data-stack="${stack.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" style="padding:2px 8px;border-radius:6px;font-size:12px;background:var(--bg-secondary);color:var(--text-muted);border:1px solid var(--border);cursor:pointer">Copy</button>`;
			}
		}
	];

	$effect(() => { load(); });
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-[var(--text-primary)]">Error Logs</h1>
		<div class="flex items-center gap-3">
			<span class="text-sm text-[var(--text-muted)]">{total} errors</span>
			<Button class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm hover:bg-[var(--accent)] hover:text-white transition-colors" onclick={resetFilter}>Reset</Button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 mb-4 items-end">
<Select bind:value={filterLevel} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" options={[{ value: "", label: "All levels" }, { value: "error", label: "Error" }, { value: "warning", label: "Warning" }, { value: "critical", label: "Critical" }]} />
<Input bind:value={filterSearch} placeholder="Search message, URL, stack..." class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm w-64" />
		<div class="flex items-center gap-2">
			<input type="date" bind:value={filterStartDate} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
			<span class="text-[var(--text-muted)]">to</span>
			<input type="date" bind:value={filterEndDate} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
		</div>
		<Button class="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90" onclick={applyFilter}>Apply</Button>
	</div>

	<!-- DataTable -->
	<div class="card">
		{#if loading}
			<div class="skeleton-list">
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
				<div class="skeleton-row"></div>
			</div>
		{:else}
			<DataTable
				{columns}
				data={logs}
				pageSize={50}
				showPagination={false}
				showSearch={false}
				emptyMessage="No errors yet. System is running clean! 🎉"
				emptyIcon=""
			/>
		{/if}
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between mt-4 text-sm">
		<Button onclick={prevPage} disabled={page <= 1}
			class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--accent)] hover:text-white transition-colors">
			← Prev
		</Button>
		<span class="text-[var(--text-muted)]">Page {page} of {totalPages}</span>
		<Button onclick={nextPage} disabled={page >= totalPages}
			class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--accent)] hover:text-white transition-colors">
			Next →
		</Button>
	</div>
</div>

<style>
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.skeleton-list { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; }
	.skeleton-row { height: 3rem; background: var(--bg-secondary); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>

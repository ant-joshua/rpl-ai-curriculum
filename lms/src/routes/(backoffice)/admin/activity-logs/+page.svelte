<script lang="ts">
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let logs: any[] = $state([]);
	let loading = $state(true);
	let page = $state(1);
	let totalPages = $state(1);
	let total = $state(0);
	let filterAction = $state('');
	let filterUser = $state('');

	const API = '/api/admin/activity-logs';

	async function load() {
		loading = true;
		const params = new URLSearchParams({ page: String(page), limit: '50' });
		if (filterAction) params.set('action', filterAction);
		if (filterUser) params.set('userId', filterUser);
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

	function formatDate(d: string) {
		if (!d) return '-';
		return new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
	}

	function actionBadge(action: string) {
		const colors: Record<string, string> = {
			read: 'background:#3b82f6;color:#fff', create: 'background:#22c55e;color:#fff',
			update: 'background:#eab308;color:#fff', delete: 'background:#ef4444;color:#fff',
			login: 'background:#6366f1;color:#fff', logout: 'background:#6b7280;color:#fff',
			error: 'background:#b91c1c;color:#fff',
		};
		return colors[action] || 'background:#6b7280;color:#fff';
	}

	function getEntityLabel(log: any): string {
		const parts = [log.entity_type, log.entity_id].filter(Boolean);
		return parts.length ? parts.join(' #') : '-';
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Time',
			accessorKey: 'created_at',
			cell: ({ getValue }) => `<span style="font-size:12px;color:var(--text-secondary);white-space:nowrap">${formatDate(getValue() as string)}</span>`
		},
		{
			header: 'User',
			accessorKey: 'username',
			cell: ({ getValue }) => `<span style="font-weight:500;color:var(--text-primary)">${getValue() || '-'}</span>`
		},
		{
			header: 'Action',
			accessorKey: 'action',
			cell: ({ getValue }) => {
				const action = getValue() as string;
				return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;${actionBadge(action)}">${action}</span>`;
			}
		},
		{
			header: 'Method',
			accessorKey: 'method',
			cell: ({ getValue }) => `<span style="font-size:12px;font-family:monospace;color:var(--text-secondary)">${getValue() || '-'}</span>`
		},
		{
			header: 'Path',
			accessorKey: 'path',
			cell: ({ getValue }) => {
				const path = getValue() as string;
				return `<span style="font-size:12px;font-family:monospace;color:var(--text-secondary);max-width:300px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${(path || '').replace(/"/g, '&quot;')}">${path || '-'}</span>`;
			}
		},
		{
			header: 'Status',
			accessorKey: 'status_code',
			cell: ({ getValue }) => {
				const code = getValue() as number;
				const color = code && code >= 400 ? '#f87171' : '#4ade80';
				return `<span style="font-family:monospace;font-size:12px;color:${color}">${code || '-'}</span>`;
			}
		},
		{
			header: 'Duration',
			accessorKey: 'duration_ms',
			cell: ({ getValue }) => {
				const ms = getValue() as number;
				return `<span style="font-size:12px;color:var(--text-secondary)">${ms ? ms + 'ms' : '-'}</span>`;
			}
		},
		{
			header: 'Entity',
			accessorKey: 'entity_type',
			cell: ({ getValue, row }) => `<span style="font-size:12px;color:var(--text-secondary)">${getEntityLabel(row.original)}</span>`
		},
		{
			header: 'IP',
			accessorKey: 'ip_address',
			cell: ({ getValue }) => `<span style="font-size:12px;font-family:monospace;color:var(--text-secondary)">${getValue() || '-'}</span>`
		}
	];

	$effect(() => { load(); });
  import { t } from '$lib/stores/i18n.svelte';
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-[var(--text-primary)]">{t('admin.activity_logs')}</h1>
		<span class="text-sm text-[var(--text-muted)]">{total} events</span>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 mb-4">
<Select bind:value={filterAction} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" options={[{ value: "", label: "All actions" }, { value: "read", label: "Read" }, { value: "create", label: t('common.create') }, { value: "update", label: "Update" }, { value: "delete", label: t('common.delete') }, { value: "login", label: "Login" }, { value: "logout", label: "Logout" }, { value: "error", label: "Error" }]} />
<Input bind:value={filterUser} placeholder="User ID" class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
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
				emptyMessage="No logs yet"
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

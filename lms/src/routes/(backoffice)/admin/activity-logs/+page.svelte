<script lang="ts">
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
			read: 'bg-blue-500', create: 'bg-green-500', update: 'bg-yellow-500',
			delete: 'bg-red-500', login: 'bg-indigo-500', logout: 'bg-gray-500',
			error: 'bg-red-700',
		};
		return colors[action] || 'bg-gray-400';
	}

	function getEntityLabel(log: any): string {
		const parts = [log.entity_type, log.entity_id].filter(Boolean);
		return parts.length ? parts.join(' #') : '-';
	}

	$effect(() => { load(); });
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-[var(--text-primary)]">Activity Logs</h1>
		<span class="text-sm text-[var(--text-muted)]">{total} events</span>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 mb-4">
		<select bind:value={filterAction} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm">
			<option value="">All actions</option>
			<option value="read">Read</option>
			<option value="create">Create</option>
			<option value="update">Update</option>
			<option value="delete">Delete</option>
			<option value="login">Login</option>
			<option value="logout">Logout</option>
			<option value="error">Error</option>
		</select>
		<input bind:value={filterUser} placeholder="User ID" class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
		<button onclick={applyFilter} class="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">Apply</button>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-xl border border-[var(--border)]">
		<table class="w-full text-sm">
			<thead class="bg-[var(--bg-secondary)] text-[var(--text-muted)]">
				<tr>
					<th class="px-4 py-3 text-left font-medium">Time</th>
					<th class="px-4 py-3 text-left font-medium">User</th>
					<th class="px-4 py-3 text-left font-medium">Action</th>
					<th class="px-4 py-3 text-left font-medium">Method</th>
					<th class="px-4 py-3 text-left font-medium">Path</th>
					<th class="px-4 py-3 text-left font-medium">Status</th>
					<th class="px-4 py-3 text-left font-medium">Duration</th>
					<th class="px-4 py-3 text-left font-medium">Entity</th>
					<th class="px-4 py-3 text-left font-medium">IP</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[var(--border)]">
				{#if loading}
					<tr><td colspan="9" class="px-4 py-8 text-center text-[var(--text-muted)]">Loading...</td></tr>
				{:else if logs.length === 0}
					<tr><td colspan="9" class="px-4 py-8 text-center text-[var(--text-muted)]">No logs yet</td></tr>
				{:else}
					{#each logs as log}
						<tr class="hover:bg-[var(--bg-secondary)] transition-colors">
							<td class="px-4 py-2.5 text-[var(--text-secondary)] whitespace-nowrap text-xs">{formatDate(log.created_at)}</td>
							<td class="px-4 py-2.5">
								<div class="text-[var(--text-primary)] font-medium">{log.username || '-'}</div>
							</td>
							<td class="px-4 py-2.5">
								<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white {actionBadge(log.action)}">
									{log.action}
								</span>
							</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] font-mono text-xs">{log.method || '-'}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] font-mono text-xs max-w-[300px] truncate" title={log.path}>{log.path || '-'}</td>
							<td class="px-4 py-2.5">
								<span class="font-mono text-xs {log.status_code && log.status_code >= 400 ? 'text-red-400' : 'text-green-400'}">{log.status_code || '-'}</span>
							</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] text-xs">{log.duration_ms ? `${log.duration_ms}ms` : '-'}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] text-xs">{getEntityLabel(log)}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] text-xs font-mono">{log.ip_address || '-'}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	<div class="flex items-center justify-between mt-4 text-sm">
		<button onclick={prevPage} disabled={page <= 1}
			class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--accent)] hover:text-white transition-colors">
			← Prev
		</button>
		<span class="text-[var(--text-muted)]">Page {page} of {totalPages}</span>
		<button onclick={nextPage} disabled={page >= totalPages}
			class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] disabled:opacity-40 hover:bg-[var(--accent)] hover:text-white transition-colors">
			Next →
		</button>
	</div>
</div>

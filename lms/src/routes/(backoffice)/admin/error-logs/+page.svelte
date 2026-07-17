<script lang="ts">
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
			error: 'bg-red-500',
			warning: 'bg-yellow-500',
			critical: 'bg-red-700',
		};
		return colors[level] || 'bg-gray-400';
	}

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}

	$effect(() => { load(); });
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-[var(--text-primary)]">Error Logs</h1>
		<div class="flex items-center gap-3">
			<span class="text-sm text-[var(--text-muted)]">{total} errors</span>
			<button onclick={resetFilter} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm hover:bg-[var(--accent)] hover:text-white transition-colors">Reset</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap gap-3 mb-4 items-end">
		<select bind:value={filterLevel} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm">
			<option value="">All levels</option>
			<option value="error">Error</option>
			<option value="warning">Warning</option>
			<option value="critical">Critical</option>
		</select>
		<input bind:value={filterSearch} placeholder="Search message, URL, stack..." class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm w-64" />
		<div class="flex items-center gap-2">
			<input type="date" bind:value={filterStartDate} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
			<span class="text-[var(--text-muted)]">to</span>
			<input type="date" bind:value={filterEndDate} class="px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] text-sm" />
		</div>
		<button onclick={applyFilter} class="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">Apply</button>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-xl border border-[var(--border)]">
		<table class="w-full text-sm">
			<thead class="bg-[var(--bg-secondary)] text-[var(--text-muted)]">
				<tr>
					<th class="px-4 py-3 text-left font-medium">Time</th>
					<th class="px-4 py-3 text-left font-medium">Level</th>
					<th class="px-4 py-3 text-left font-medium">Message</th>
					<th class="px-4 py-3 text-left font-medium">URL</th>
					<th class="px-4 py-3 text-left font-medium">Method</th>
					<th class="px-4 py-3 text-left font-medium">User</th>
					<th class="px-4 py-3 text-left font-medium">Stack</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-[var(--border)]">
				{#if loading}
					<tr><td colspan="7" class="px-4 py-8 text-center text-[var(--text-muted)]">Loading...</td></tr>
				{:else if logs.length === 0}
					<tr><td colspan="7" class="px-4 py-8 text-center text-[var(--text-muted)]">No errors yet. System is running clean! 🎉</td></tr>
				{:else}
					{#each logs as log}
						<tr class="hover:bg-[var(--bg-secondary)] transition-colors">
							<td class="px-4 py-2.5 text-[var(--text-secondary)] whitespace-nowrap text-xs">{formatDate(log.created_at)}</td>
							<td class="px-4 py-2.5">
								<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white {levelBadge(log.level)}">
									{log.level}
								</span>
							</td>
							<td class="px-4 py-2.5 text-[var(--text-primary)] text-xs max-w-[300px] truncate font-mono" title={log.message}>{log.message}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] font-mono text-xs max-w-[200px] truncate" title={log.url}>{log.url || '-'}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] font-mono text-xs">{log.method || '-'}</td>
							<td class="px-4 py-2.5 text-[var(--text-secondary)] text-xs">{log.username || log.user_name || log.user_id || '-'}</td>
							<td class="px-4 py-2.5">
								{#if log.stack}
									<button onclick={() => copyText(log.stack)}
										class="px-2 py-0.5 rounded text-xs bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--accent)] transition-colors"
										title="Copy stack trace">
										Copy
									</button>
								{:else}
									<span class="text-[var(--text-muted)] text-xs">-</span>
								{/if}
							</td>
						</tr>
						{#if log.stack}
							<tr class="bg-[var(--bg-secondary)]/50">
								<td colspan="7" class="px-4 py-2">
									<pre class="text-xs text-[var(--text-muted)] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">{log.stack}</pre>
								</td>
							</tr>
						{/if}
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

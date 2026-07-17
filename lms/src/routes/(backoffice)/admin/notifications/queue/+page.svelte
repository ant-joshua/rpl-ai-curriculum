<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let items = $state<any[]>([]);
	let pagination = $state<any>({ page: 1, totalPages: 1, total: 0 });
	let statusFilter = $state('');
	let channelFilter = $state('');
	let retrying = $state(false);

	const statuses = ['queued', 'processing', 'sent', 'failed'];

	onMount(() => {
		if (browser) loadQueue();
	});

	async function loadQueue() {
		loading = true; error = '';
		try {
			const params = new URLSearchParams({ page: String(pagination.page), limit: '50' });
			if (statusFilter) params.set('status', statusFilter);
			if (channelFilter) params.set('channel', channelFilter);
			const res = await fetch(`/api/admin/notifications/queue?${params}`);
			const json = await res.json();
			if (json.success) {
				items = json.data || [];
				pagination = json.pagination || pagination;
			} else error = 'Gagal memuat queue';
		} catch { error = 'Gagal terhubung ke server';
		} finally { loading = false; }
	}

	async function retryFailed() {
		retrying = true;
		try {
			const res = await fetch('/api/admin/notifications/queue', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'retry-failed', max: 100 }),
			});
			const json = await res.json();
			if (json.success) await loadQueue();
			else error = json.error || 'Gagal retry';
		} catch { error = 'Gagal terhubung ke server';
		} finally { retrying = false; }
	}

	function statusColor(s: string): string {
		const map: Record<string,string> = { sent:'status-blue', delivered:'status-green', failed:'status-red', pending:'status-yellow', queued:'status-yellow', processing:'status-blue' };
		return map[s] || 'status-yellow';
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try { return new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); } catch { return d; }
	}
</script>

<svelte:head>
	<title>Notification Queue — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📨 Antrian Notifikasi</h1>
			<p class="subtitle">Monitor dan kelola antrian notifikasi keluar</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadQueue}>🔄</button>
			<button class="btn-outline" onclick={retryFailed} disabled={retrying}>
				{retrying ? 'Meretry...' : 'Retry Failed'}
			</button>
		</div>
	</div>

	<!-- Filters -->
	<div class="filter-bar">
		<span class="filter-label">Status:</span>
		<button class="filter-btn" class:active={statusFilter === ''} onclick={() => { statusFilter = ''; pagination.page = 1; loadQueue(); }}>Semua</button>
		{#each statuses as s}
			<button class="filter-btn" class:active={statusFilter === s} onclick={() => { statusFilter = s; pagination.page = 1; loadQueue(); }}>{s}</button>
		{/each}
		<span class="filter-label" style="margin-left:12px">Channel:</span>
		<button class="filter-btn" class:active={channelFilter === ''} onclick={() => { channelFilter = ''; pagination.page = 1; loadQueue(); }}>Semua</button>
		<button class="filter-btn" class:active={channelFilter === 'in_app'} onclick={() => { channelFilter = 'in_app'; pagination.page = 1; loadQueue(); }}>In-App</button>
		<button class="filter-btn" class:active={channelFilter === 'email'} onclick={() => { channelFilter = 'email'; pagination.page = 1; loadQueue(); }}>Email</button>
		<button class="filter-btn" class:active={channelFilter === 'whatsapp'} onclick={() => { channelFilter = 'whatsapp'; pagination.page = 1; loadQueue(); }}>WhatsApp</button>
	</div>

	{#if error}
		<div class="error-state"><p class="error-msg">{error}</p><button class="btn-primary" onclick={loadQueue}>Coba Lagi</button></div>
	{/if}

	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if items.length === 0}
		<div class="empty-state"><p>Belum ada antrian notifikasi</p></div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>User</th>
							<th>Channel</th>
							<th>Subject</th>
							<th>Body</th>
							<th>Status</th>
							<th>Attempts</th>
							<th>Error</th>
							<th>Dibuat</th>
						</tr>
					</thead>
					<tbody>
						{#each items as n}
							<tr>
								<td class="cell-mono">{n.user_id ? n.user_id.slice(0,8) + '...' : '—'}</td>
								<td>
									<span class="channel-badge">{n.channel}</span>
								</td>
								<td class="cell-maxwidth">{n.subject || '—'}</td>
								<td class="cell-maxwidth">{n.body?.length > 60 ? n.body.slice(0,60) + '...' : n.body || '—'}</td>
								<td><span class="status-badge {statusColor(n.status)}">{n.status}</span></td>
								<td class="cell-center">{n.attempts}/{n.max_attempts}</td>
								<td class="cell-error">{n.last_error || '—'}</td>
								<td>{formatDate(n.created_at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		{#if pagination.totalPages > 1}
			<div class="pagination">
				<button class="btn-outline" disabled={pagination.page <= 1} onclick={() => { pagination.page--; loadQueue(); }}>←</button>
				<span class="page-info">{pagination.page}/{pagination.totalPages}</span>
				<button class="btn-outline" disabled={pagination.page >= pagination.totalPages} onclick={() => { pagination.page++; loadQueue(); }}>→</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1200px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-outline { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-outline:hover:not(:disabled) { background: var(--hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }

	.filter-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
	.filter-btn { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-secondary); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-transform: capitalize; }
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	tr:hover td { background: var(--hover); }
	.cell-mono { font-family: monospace; font-size: 12px; }
	.cell-center { text-align: center; }
	.cell-maxwidth { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.cell-error { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); font-size: 12px; }

	.status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
	.status-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-green { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-red { background: rgba(239,68,68,0.1); color: #ef4444; }
	.status-yellow { background: rgba(245,158,11,0.1); color: #f59e0b; }

	.channel-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; background: rgba(98,102,109,0.15); color: #8a8f98; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 20px; }
	.page-info { font-size: 13px; color: var(--text-secondary); }
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');

	let stats = $state<any>({ total: 0, sent: 0, delivered: 0, failed: 0, pending: 0 });
	let channels = $state<any[]>([]);
	let recentQueue = $state<any[]>([]);

	onMount(() => {
		if (browser) loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [statsRes, channelsRes, queueRes] = await Promise.all([
				fetch('/api/admin/notifications/stats'),
				fetch('/api/admin/notifications/channels'),
				fetch('/api/admin/notifications/queue?limit=10')
			]);

			const statsJson = await statsRes.json();
			const channelsJson = await channelsRes.json();
			const queueJson = await queueRes.json();

			if (statsJson.success) stats = statsJson.data;
			if (channelsJson.success) channels = channelsJson.data || [];
			if (queueJson.success) recentQueue = queueJson.data || [];

			if (!statsJson.success) error = 'Gagal memuat statistik notifikasi';
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'sent': return 'status-sent';
			case 'delivered': return 'status-delivered';
			case 'failed': return 'status-failed';
			case 'pending': return 'status-pending';
			default: return 'status-pending';
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
		} catch { return d; }
	}

	function channelTypeBadge(type: string): string {
		switch (type) {
			case 'email': return 'channel-email';
			case 'sms': return 'channel-sms';
			case 'push': return 'channel-push';
			case 'in_app': return 'channel-inapp';
			default: return 'channel-email';
		}
	}
</script>

<svelte:head>
	<title>Notifications — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🔔 Notifications</h1>
			<p class="subtitle">Dashboard notifikasi: statistik, channel, dan queue terbaru</p>
		</div>
		<button class="btn-refresh" onclick={loadAll}>🔄</button>
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadAll}>Coba Lagi</button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-row">
			<div class="stat-card stat-card--total">
				<span class="stat-number">{loading ? '—' : stats.total}</span>
				<span class="stat-label">Total</span>
			</div>
			<div class="stat-card stat-card--sent">
				<span class="stat-number">{loading ? '—' : stats.sent}</span>
				<span class="stat-label">Sent</span>
			</div>
			<div class="stat-card stat-card--delivered">
				<span class="stat-number">{loading ? '—' : stats.delivered}</span>
				<span class="stat-label">Delivered</span>
			</div>
			<div class="stat-card stat-card--failed">
				<span class="stat-number">{loading ? '—' : stats.failed}</span>
				<span class="stat-label">Failed</span>
			</div>
			<div class="stat-card stat-card--pending">
				<span class="stat-number">{loading ? '—' : stats.pending}</span>
				<span class="stat-label">Pending</span>
			</div>
		</div>

		<div class="grid-2col">
			<!-- Channels -->
			<div class="card">
				<div class="card-header">
					<h3>Channels</h3>
					<a href="/admin/notifications" class="link-btn">Kelola →</a>
				</div>
				{#if loading}
					<div class="loading">Memuat channel...</div>
				{:else if channels.length === 0}
					<div class="empty-state small">
						<p>Belum ada channel</p>
					</div>
				{:else}
					<div class="channel-list">
						{#each channels.slice(0, 8) as ch}
							<div class="channel-row">
								<span class="channel-name">{ch.name}</span>
								<span class="channel-type-badge {channelTypeBadge(ch.type)}">{ch.type}</span>
								<span class="channel-status" class:active={ch.is_active === 1}>
									{ch.is_active === 1 ? 'Active' : 'Inactive'}
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Recent Queue -->
			<div class="card">
				<div class="card-header">
					<h3>Recent Queue</h3>
					<a href="/admin/notifications/queue" class="link-btn">Lihat Semua →</a>
				</div>
				{#if loading}
					<div class="loading">Memuat queue...</div>
				{:else if recentQueue.length === 0}
					<div class="empty-state small">
						<p>Belum ada notifikasi di queue</p>
					</div>
				{:else}
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Recipient</th>
									<th>Channel</th>
									<th>Status</th>
									<th>Waktu</th>
								</tr>
							</thead>
							<tbody>
								{#each recentQueue as n}
									<tr>
										<td class="cell-name">{n.recipient_address || n.recipient_id || '—'}</td>
										<td><span class="channel-type-badge {channelTypeBadge(n.channel_type)}">{n.channel_type}</span></td>
										<td><span class="status-badge {statusColor(n.status)}">{n.status}</span></td>
										<td>{formatDate(n.created_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
	}
	.stat-card--total { border-top: 3px solid var(--text-secondary); }
	.stat-card--sent { border-top: 3px solid #3b82f6; }
	.stat-card--delivered { border-top: 3px solid #10b981; }
	.stat-card--failed { border-top: 3px solid #ef4444; }
	.stat-card--pending { border-top: 3px solid #f59e0b; }
	.stat-number { display: block; font-size: 28px; font-weight: 700; color: var(--text); }
	.stat-label { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

	.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
	}
	.card-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
	.link-btn { font-size: 13px; color: var(--accent); text-decoration: none !important; }

	.loading { text-align: center; padding: 30px; color: var(--text-secondary); font-size: 13px; }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 40px 20px; color: var(--text-secondary); }
	.empty-state.small { padding: 30px; }
	.empty-state p { margin: 0; }

	/* Channel list */
	.channel-list { padding: 8px; }
	.channel-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		transition: background 0.15s;
	}
	.channel-row:hover { background: var(--bg-secondary); }
	.channel-name { flex: 1; font-size: 13px; font-weight: 500; color: var(--text); }
	.channel-status { font-size: 11px; color: var(--text-secondary); }
	.channel-status.active { color: #10b981; }

	.channel-type-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.channel-email { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.channel-sms { background: rgba(139,92,246,0.1); color: #8b5cf6; }
	.channel-push { background: rgba(245,158,11,0.1); color: #f59e0b; }
	.channel-inapp { background: rgba(16,185,129,0.1); color: #10b981; }

	/* Table */
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }

	/* Status badges */
	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: capitalize;
	}
	.status-sent { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-delivered { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-failed { background: rgba(239,68,68,0.1); color: #ef4444; }
	.status-pending { background: rgba(245,158,11,0.1); color: #f59e0b; }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
		.grid-2col { grid-template-columns: 1fr; }
	}
</style>

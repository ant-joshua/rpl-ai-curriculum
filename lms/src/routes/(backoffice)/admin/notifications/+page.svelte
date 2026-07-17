<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let loading = $state(true);
	let error = $state('');
	let stats = $state<Record<string, number>>({ queued: 0, processing: 0, sent: 0, failed: 0 });
	let recentQueue = $state<any[]>([]);
	let showBroadcast = $state(false);
	let broadcastType = $state('announcement');
	let broadcastTitle = $state('');
	let broadcastBody = $state('');
	let broadcastChannel = $state('in_app');
	let broadcasting = $state(false);
	let broadcastResult = $state('');

	const types = ['assessment','assignment','attendance','payment','grade','system','announcement'];

	onMount(() => {
		if (browser) loadAll();
	});

	async function loadAll() {
		loading = true; error = '';
		try {
			const [statsRes, queueRes] = await Promise.all([
				fetch('/api/admin/notifications/stats'),
				fetch('/api/admin/notifications/queue?limit=10'),
			]);
			const statsJson = await statsRes.json();
			const queueJson = await queueRes.json();
			if (statsJson.success) stats = statsJson.data;
			if (queueJson.success) recentQueue = queueJson.data || [];
			if (!statsJson.success) error = 'Gagal memuat statistik';
		} catch { error = 'Gagal terhubung ke server';
		} finally { loading = false; }
	}

	async function sendBroadcast() {
		if (!broadcastTitle || !broadcastType) return;
		broadcasting = true; broadcastResult = '';
		try {
			const res = await fetch('/api/admin/notifications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: broadcastType,
					title: broadcastTitle,
					body: broadcastBody || undefined,
					channel: broadcastChannel,
				}),
			});
			const json = await res.json();
			if (json.success) {
				broadcastResult = json.message || 'Broadcast berhasil!';
				showBroadcast = false;
				loadAll();
			} else {
				broadcastResult = json.error || 'Gagal broadcast';
			}
		} catch { broadcastResult = 'Gagal terhubung ke server';
		} finally { broadcasting = false; }
	}

	function statusColor(s: string): string {
		const map: Record<string,string> = { sent: 'status-blue', delivered: 'status-green', failed: 'status-red', pending: 'status-yellow', queued: 'status-yellow', processing: 'status-blue' };
		return map[s] || 'status-yellow';
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try { return new Date(d).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }); } catch { return d; }
	}
</script>

<svelte:head>
	<title>Notifications — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🔔 Notifications</h1>
			<p class="subtitle">Broadcast, queue monitoring, dan statistik notifikasi</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadAll}>🔄</button>
			<button class="btn-primary" onclick={() => showBroadcast = true}>📢 Broadcast</button>
		</div>
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadAll}>Coba Lagi</button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-row">
			{#each ['queued','processing','sent','failed'] as s}
				<div class="stat-card stat-card--{s}">
					<span class="stat-number">{loading ? '—' : (stats[s] ?? 0)}</span>
					<span class="stat-label">{s}</span>
				</div>
			{/each}
		</div>

		<div class="grid-2col">
			<!-- Recent Queue -->
			<div class="card">
				<div class="card-header">
					<h3>Antrian Terbaru</h3>
					<a href="/admin/notifications/queue" class="link-btn">Lihat Semua →</a>
				</div>
				{#if loading}
					<div class="loading">Memuat...</div>
				{:else if recentQueue.length === 0}
					<div class="empty-state small"><p>Belum ada antrian</p></div>
				{:else}
					<div class="table-container">
						<table>
							<thead><tr><th>Channel</th><th>Status</th><th>Waktu</th></tr></thead>
							<tbody>
								{#each recentQueue as n}
									<tr>
										<td><span class="channel-badge">{n.channel}</span></td>
										<td><span class="status-badge {statusColor(n.status)}">{n.status}</span></td>
										<td>{formatDate(n.created_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<!-- Quick links -->
			<div class="card">
				<div class="card-header"><h3>Menu Cepat</h3></div>
				<div class="quick-links">
					<a href="/admin/notifications/templates" class="quick-link">
						<span class="ql-icon">📋</span>
						<span class="ql-text">Kelola Template</span>
					</a>
					<a href="/admin/notifications/queue" class="quick-link">
						<span class="ql-icon">📨</span>
						<span class="ql-text">Monitoring Queue</span>
					</a>
					<button class="quick-link" onclick={() => showBroadcast = true}>
						<span class="ql-icon">📢</span>
						<span class="ql-text">Broadcast Baru</span>
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Broadcast Modal -->
	{#if showBroadcast}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={() => showBroadcast = false}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>📢 Broadcast Notifikasi</h3>
					<button class="btn-close" onclick={() => showBroadcast = false}>✕</button>
				</div>
				<div class="modal-body">
					{#if broadcastResult}
						<div class="result-msg">{broadcastResult}</div>
					{/if}
					<div class="form-row">
						<label class="form-label">Tipe</label>
						<select class="form-input" bind:value={broadcastType}>
							{#each types as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</div>
					<div class="form-row">
						<label class="form-label">Channel</label>
						<select class="form-input" bind:value={broadcastChannel}>
							<option value="in_app">In-App</option>
							<option value="email">Email</option>
							<option value="whatsapp">WhatsApp</option>
						</select>
					</div>
					<div class="form-row">
						<label class="form-label">Judul *</label>
						<input class="form-input" bind:value={broadcastTitle} placeholder="Judul notifikasi" />
					</div>
					<div class="form-row">
						<label class="form-label">Pesan (opsional)</label>
						<textarea class="form-textarea" bind:value={broadcastBody} rows="4" placeholder="Isi pesan..."></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={() => showBroadcast = false}>Batal</button>
					<button class="btn-primary" onclick={sendBroadcast} disabled={broadcasting || !broadcastTitle}>
						{broadcasting ? 'Mengirim...' : 'Kirim Broadcast'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }

	.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
	.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; text-align: center; }
	.stat-card--queued { border-top: 3px solid #f59e0b; }
	.stat-card--processing { border-top: 3px solid #3b82f6; }
	.stat-card--sent { border-top: 3px solid #10b981; }
	.stat-card--failed { border-top: 3px solid #ef4444; }
	.stat-number { display: block; font-size: 28px; font-weight: 700; color: var(--text); }
	.stat-label { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

	.grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
	.card-header h3 { margin: 0; font-size: 14px; font-weight: 600; }
	.link-btn { font-size: 13px; color: var(--accent); text-decoration: none !important; }
	.loading { text-align: center; padding: 30px; color: var(--text-secondary); font-size: 13px; }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 40px 20px; color: var(--text-secondary); }
	.empty-state.small { padding: 30px; }
	.empty-state p { margin: 0; }

	/* Table */
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }

	.status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
	.status-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }
	.status-green { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-red { background: rgba(239,68,68,0.1); color: #ef4444; }
	.status-yellow { background: rgba(245,158,11,0.1); color: #f59e0b; }

	.channel-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; text-transform: uppercase; background: rgba(98,102,109,0.15); color: #8a8f98; }

	/* Quick Links */
	.quick-links { padding: 8px; display: flex; flex-direction: column; gap: 4px; }
	.quick-link {
		display: flex; align-items: center; gap: 12px; padding: 12px;
		border-radius: 8px; color: var(--text); text-decoration: none !important;
		font-size: 14px; font-weight: 500; cursor: pointer;
		background: none; border: none; width: 100%; text-align: left; font-family: inherit;
		transition: background 0.15s;
	}
	.quick-link:hover { background: var(--hover); }
	.ql-icon { font-size: 20px; width: 28px; text-align: center; }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 520px; max-width: 95vw; max-height: 85vh; overflow-y: auto; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; border-bottom: 1px solid var(--border); }
	.modal-header h3 { margin: 0; font-size: 16px; }
	.btn-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
	.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }
	.form-row { display: flex; flex-direction: column; gap: 6px; }
	.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
	.form-input, .form-textarea { width: 100%; padding: 10px 12px; font-size: 13px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text); outline: none; font-family: inherit; }
	.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
	textarea.form-textarea { resize: vertical; }
	.result-msg { padding: 10px 14px; background: rgba(16,185,129,0.1); color: #10b981; border-radius: 8px; font-size: 13px; }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
		.grid-2col { grid-template-columns: 1fr; }
	}
</style>

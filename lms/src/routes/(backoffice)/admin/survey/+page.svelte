<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let loading = $state(true);
	let error = $state('');

	let stats = $state<any>({ totalTemplates: 0, activeInstances: 0, closedInstances: 0, totalResponses: 0 });
	let recentInstances = $state<any[]>([]);
	let templates = $state<any[]>([]);

	onMount(() => {
		if (browser) loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [statsRes, instRes, tmplRes] = await Promise.all([
				fetch('/api/admin/survey/stats'),
				fetch('/api/admin/survey/instances?limit=10'),
				fetch('/api/admin/survey/templates'),
			]);

			const statsJson = await statsRes.json();
			const instJson = await instRes.json();
			const tmplJson = await tmplRes.json();

			if (statsJson.success) stats = statsJson.data;
			if (instJson.success) recentInstances = (instJson.data || []).slice(0, 5);
			if (tmplJson.success) templates = tmplJson.data || [];

			if (!statsJson.success) error = 'Gagal memuat statistik survey';
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function statusColor(s: string): string {
		switch (s) {
			case 'active': return 'status-active';
			case 'closed': return 'status-closed';
			case 'draft': return 'status-draft';
			case 'archived': return 'status-archived';
			default: return 'status-draft';
		}
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
		} catch { return d; }
	}
</script>

<svelte:head>
	<title>Survey — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📊 Survey & Feedback</h1>
			<p class="subtitle">Dashboard survei: statistik, survei terbaru, dan aksi cepat</p>
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
			<div class="stat-card stat-card--templates">
				<span class="stat-number">{loading ? '—' : stats.totalTemplates}</span>
				<span class="stat-label">Templates</span>
			</div>
			<div class="stat-card stat-card--active">
				<span class="stat-number">{loading ? '—' : stats.activeInstances}</span>
				<span class="stat-label">Active</span>
			</div>
			<div class="stat-card stat-card--closed">
				<span class="stat-number">{loading ? '—' : stats.closedInstances}</span>
				<span class="stat-label">Closed</span>
			</div>
			<div class="stat-card stat-card--responses">
				<span class="stat-number">{loading ? '—' : stats.totalResponses}</span>
				<span class="stat-label">Responses</span>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="quick-actions">
			<h3>Aksi Cepat</h3>
			<div class="action-row">
				<button class="btn-primary" onclick={() => goto('/admin/survey/templates')}>+ Template Baru</button>
				<button class="btn-secondary" onclick={() => goto('/admin/survey/instances')}>+ Buat Survei</button>
				<button class="btn-secondary" onclick={() => goto('/admin/survey/instances')}>Lihat Semua Instance</button>
			</div>
		</div>

		<div class="grid-2col">
			<!-- Recent Instances -->
			<div class="card">
				<div class="card-header">
					<h3>Survei Terbaru</h3>
					<a href="/admin/survey/instances" class="link-btn">Lihat Semua →</a>
				</div>
				{#if loading}
					<div class="loading">Memuat survei...</div>
				{:else if recentInstances.length === 0}
					<div class="empty-state small">
						<p>Belum ada survei</p>
					</div>
				{:else}
					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th>Title</th>
									<th>Status</th>
									<th>Target</th>
									<th>Waktu</th>
								</tr>
							</thead>
							<tbody>
								{#each recentInstances as inst}
									<tr>
										<td class="cell-name">{inst.title}</td>
										<td><span class="status-badge {statusColor(inst.status)}">{inst.status}</span></td>
										<td>{inst.target_type || '—'}</td>
										<td>{formatDate(inst.created_at)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<!-- Templates Summary -->
			<div class="card">
				<div class="card-header">
					<h3>Templates</h3>
					<a href="/admin/survey/templates" class="link-btn">Kelola →</a>
				</div>
				{#if loading}
					<div class="loading">Memuat template...</div>
				{:else if templates.length === 0}
					<div class="empty-state small">
						<p>Belum ada template</p>
					</div>
				{:else}
					<div class="template-list">
						{#each templates.slice(0, 8) as t}
							<div class="template-row">
								<div class="template-info">
									<span class="template-name">{t.name}</span>
									<span class="template-meta">{t.survey_type || 'feedback'} · {t.description?.slice(0, 40) || '—'}</span>
								</div>
								<span class="template-active" class:active={t.is_active === 1}>
									{t.is_active === 1 ? 'Active' : 'Inactive'}
								</span>
							</div>
						{/each}
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
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; text-decoration: none; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; text-decoration: none; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
	}
	.stat-card--templates { border-top: 3px solid #8b5cf6; }
	.stat-card--active { border-top: 3px solid #10b981; }
	.stat-card--closed { border-top: 3px solid #f59e0b; }
	.stat-card--responses { border-top: 3px solid #3b82f6; }
	.stat-number { display: block; font-size: 28px; font-weight: 700; color: var(--text); }
	.stat-label { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

	.quick-actions { margin-bottom: 24px; }
	.quick-actions h3 { font-size: 14px; font-weight: 600; margin: 0 0 10px; }
	.action-row { display: flex; gap: 8px; flex-wrap: wrap; }

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

	/* Template list */
	.template-list { padding: 8px; }
	.template-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 8px;
		transition: background 0.15s;
	}
	.template-row:hover { background: var(--bg-secondary); }
	.template-info { flex: 1; }
	.template-name { display: block; font-size: 13px; font-weight: 500; color: var(--text); }
	.template-meta { display: block; font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
	.template-active { font-size: 11px; color: var(--text-secondary); }
	.template-active.active { color: #10b981; }

	/* Table */
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: capitalize;
	}
	.status-active { background: rgba(16,185,129,0.1); color: #10b981; }
	.status-closed { background: rgba(245,158,11,0.1); color: #f59e0b; }
	.status-draft { background: rgba(98,102,109,0.15); color: #8a8f98; }
	.status-archived { background: rgba(239,68,68,0.1); color: #ef4444; }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
		.grid-2col { grid-template-columns: 1fr; }
	}
</style>

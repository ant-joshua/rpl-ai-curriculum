<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, StatCard } from '$lib/components/ui';

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
const instanceColumns: ColumnDef<any, any>[] = [
	{
		header: 'Title',
		accessorKey: 'title',
		cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
	},
	{
		header: 'Status',
		accessorKey: 'status',
		cell: ({ getValue }) => {
			const s = getValue() as string;
			return `<span class="status-badge ${statusColor(s)}">${s}</span>`;
		}
	},
	{
		header: 'Target',
		accessorKey: 'target_type',
		cell: ({ getValue }) => (getValue() as string) || '—'
	},
	{
		header: 'Waktu',
		accessorKey: 'created_at',
		cell: ({ getValue }) => formatDate(getValue() as string)
	},
];

  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📊 Survey & Feedback</h1>
			<p class="subtitle">{t('admin.survey_desc')}</p>
		</div>
		<Button class="btn-refresh" onclick={loadAll}>🔄</Button>
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadAll}>{t('common.retry')}</Button>
		</div>
	{:else}
		<!-- Stats Cards -->
		<div class="stats-row">
			<StatCard icon="📄" value={loading ? '—' : stats.totalTemplates} label="Templates" color="#8b5cf6" />
			<StatCard icon="✅" value={loading ? '—' : stats.activeInstances} label="Active" color="#10b981" />
			<StatCard icon="🔒" value={loading ? '—' : stats.closedInstances} label="Closed" color="#f59e0b" />
			<StatCard icon="💬" value={loading ? '—' : stats.totalResponses} label="Responses" color="#3b82f6" />
		</div>

		<!-- Quick Actions -->
		<div class="quick-actions">
			<h3>{t('admin.aksi_cepat')}</h3>
			<div class="action-row">
				<Button variant="primary" onclick={() => goto('/admin/survey/templates')}>{t('admin.template_baru')}</Button>
				<Button variant="secondary" onclick={() => goto('/admin/survey/instances')}>{t('admin.buat_survei')}</Button>
				<Button variant="secondary" onclick={() => goto('/admin/survey/instances')}>Lihat Semua Instance</Button>
			</div>
		</div>

		<div class="grid-2col">
			<!-- Recent Instances -->
			<div class="card">
				<div class="card-header">
					<h3>{t('admin.survei_terbaru')}</h3>
					<a href="/admin/survey/instances" class="link-btn">{t('admin.lihat_semua')}</a>
				</div>
				{#if loading}
					<div class="loading">Memuat survei...</div>
				{:else if recentInstances.length === 0}
					<div class="empty-state small">
						<p>{t('admin.belum_ada_survei')}</p>
					</div>
				{:else}
					<DataTable columns={instanceColumns} data={recentInstances} pageSize={10} showSearch={false} showPagination={false} emptyMessage="Belum ada survei" emptyIcon="📊" />
				{/if}
			</div>

			<!-- Templates Summary -->
			<div class="card">
				<div class="card-header">
					<h3>{t('admin.templates')}</h3>
					<a href="/admin/survey/templates" class="link-btn">{t('admin.kelola_arrow')}</a>
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
	.status-draft { background: rgba(98,102,109,0.15); color: #64748b; }
	.status-archived { background: rgba(239,68,68,0.1); color: #ef4444; }

	@media (max-width: 768px) {
		.stats-row { grid-template-columns: repeat(2, 1fr); }
		.grid-2col { grid-template-columns: 1fr; }
	}
</style>

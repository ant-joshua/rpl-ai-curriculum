<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, Alert, StatCard } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');
	let refetching = $state(false);

	let health: any = $state(null);
	let dbStats: any = $state(null);
	let envInfo: any = $state(null);

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [hRes, dbRes, eRes] = await Promise.all([
				fetch('/api/admin/system/health'),
				fetch('/api/admin/system/db'),
				fetch('/api/admin/system/env'),
			]);
			const h = await hRes.json();
			const db = await dbRes.json();
			const e = await eRes.json();
			if (h.success) health = h.data;
			else { error = h.error || 'Health check failed'; loading = false; return; }
			if (db.success) dbStats = db.data;
			if (e.success) envInfo = e.data;
		} catch { error = 'Failed to load system info'; }
		finally { loading = false; }
	}

	async function refresh() {
		refetching = true;
		await loadAll();
		refetching = false;
	}

	function statusBadge(ok: boolean) {
		return ok ? 'status-ok' : 'status-err';
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="sys-page">
	<div class="header-row">
		<h1>⚙️ System Admin</h1>
		<Button size="sm" onclick={refresh} disabled={refetching}>
			{refetching ? 'Refreshing...' : '🔄 Refresh'}
		</Button>
	</div>

	{#if loading}
		<div class="loading">Loading system info...</div>
	{:else if error}
		<div class="error-state">
			<Alert variant="danger">{error}</Alert>
			<Button onclick={loadAll}>{t('common.retry')}</Button>
		</div>
	{:else}

		<!-- Health -->
		<Card class="section-card">
			<CardContent>
				<h2>🩺 Health Check</h2>
				<div class="health-grid">
					<div class="health-item">
						<span class="health-label">Database</span>
						<span class={statusBadge(health?.database === 'ok')}>
							{health?.database ?? 'unknown'}
						</span>
					</div>
					<div class="health-item">
						<span class="health-label">Worker</span>
						<span class={statusBadge(health?.worker === 'ok')}>
							{health?.worker ?? 'unknown'}
						</span>
					</div>
					<div class="health-item">
						<span class="health-label">Version</span>
						<span>{health?.version ?? 'N/A'}</span>
					</div>
					<div class="health-item">
						<span class="health-label">Timestamp</span>
						<span>{health?.timestamp ?? 'N/A'}</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- DB Stats -->
		<Card class="section-card">
			<CardContent>
				<h2>🗄️ Database Stats</h2>
				<div class="stats-grid">
					<StatCard value={dbStats?.users ?? 0} label="Users" />
					<StatCard value={dbStats?.tenants ?? 0} label="Tenants" />
					<StatCard value={dbStats?.attendanceSessions ?? 0} label="Attendance Sessions" />
					<StatCard value={dbStats?.payments ?? 0} label="Payments" />
					<StatCard value={dbStats?.enrollments ?? 0} label="Enrollments" />
					<StatCard value={dbStats?.submissions ?? 0} label="Submissions" />
				</div>
				<div class="db-meta">
					<span>Tables: <strong>{dbStats?.tableCount ?? 0}</strong></span>
				</div>
				{#if dbStats?.tables?.length}
					<div class="table-list">
						<Button class="table-toggle" onclick={() => document.getElementById('table-list').classList.toggle('open')}>
							📋 Show table list ({dbStats?.tableCount ?? 0})
						</Button>
						<div id="table-list" class="table-list-items">
							{#each dbStats.tables as t}
								<span class="table-badge">{t.name}</span>
							{/each}
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Environment -->
		<Card class="section-card">
			<CardContent>
				<h2>🌐 Environment</h2>
				<div class="env-grid">
					<div class="env-item">
						<span class="env-key">D1 Database</span>
						<span class={statusBadge(envInfo?.hasDB)}>{envInfo?.hasDB ? '✅ Connected' : '❌ Missing'}</span>
					</div>
					<div class="env-item">
						<span class="env-key">R2 Assets</span>
						<span class={statusBadge(envInfo?.hasAssets)}>{envInfo?.hasAssets ? '✅ Bound' : '❌ Missing'}</span>
					</div>
					<div class="env-item">
						<span class="env-key">AI Binding</span>
						<span class={statusBadge(envInfo?.hasAI)}>{envInfo?.hasAI ? '✅ Available' : '❌ Missing'}</span>
					</div>
					<div class="env-item">
						<span class="env-key">Worker Status</span>
						<span class="status-ok">✅ Running</span>
					</div>
				</div>
			</CardContent>
		</Card>

	{/if}
</div>

<style>
	.sys-page { max-width: 900px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
	:global(.section-card) { margin-bottom: 16px; }

	/* Health */
	.health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
	.health-item { display: flex; flex-direction: column; gap: 2px; padding: 10px; background: var(--bg-secondary); border-radius: 8px; }
	.health-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
	.health-item span:last-child { font-size: 14px; font-weight: 600; }
	.status-ok { color: #22c55e; }
	.status-err { color: #ef4444; }

	/* DB Stats */
	.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-bottom: 14px; }
	.stat-item { text-align: center; padding: 12px; background: var(--bg-secondary); border-radius: 8px; }
	.stat-val { display: block; font-size: 20px; font-weight: 700; color: var(--accent); }
	.stat-lbl { display: block; font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

	.db-meta { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; }
	.table-list { }
	.table-toggle { background: none; border: 1px solid var(--border); color: var(--text-secondary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
	.table-toggle:hover { background: var(--bg-secondary); }
	.table-list-items { display: none; flex-wrap: wrap; gap: 4px; margin-top: 10px; max-height: 300px; overflow-y: auto; }
	.table-list-items.open { display: flex; }
	.table-badge { font-size: 11px; padding: 3px 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text-secondary); font-family: monospace; }

	/* Environment */
	.env-grid { display: grid; gap: 8px; }
	.env-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: var(--bg-secondary); border-radius: 8px; }
	.env-key { font-size: 13px; font-weight: 500; }

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
		.health-grid { grid-template-columns: 1fr 1fr; }
	}
</style>

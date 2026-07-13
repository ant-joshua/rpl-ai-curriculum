<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let stats: any = $state(null);
	let loading = $state(true);
	let error = $state('');

	onMount(() => {
		if (!browser) return;
		loadStats();
	});

	async function loadStats() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/admin/stats');
			const json = await res.json();
			if (json.success) stats = json.data;
			else error = json.error || 'Failed';
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}
</script>

<svelte:head>
	<title>📈 Analytics — Admin</title>
</svelte:head>

<div class="analytics-page">
	<div class="header-row">
		<h1>📈 Analytics</h1>
		<button onclick={loadStats} class="btn btn-sm">🔄 Refresh</button>
	</div>

	{#if loading}
		<div class="loading">Loading analytics...</div>
	{:else if error}
		<div class="error-state"><p>{error}</p><button onclick={loadStats} class="btn">Retry</button></div>
	{:else if stats}
		<!-- Overview Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-icon">👥</span>
				<span class="stat-value">{stats.total_users}</span>
				<span class="stat-label">Total Users</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✅</span>
				<span class="stat-value">{stats.total_sessions}</span>
				<span class="stat-label">Sessions Done</span>
				<span class="stat-sub">{stats.total_users > 0 ? (stats.total_sessions / stats.total_users).toFixed(1) : 0} avg/user</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✨</span>
				<span class="stat-value">{Number(stats.total_xp).toLocaleString()}</span>
				<span class="stat-label">Total XP</span>
				<span class="stat-sub">{stats.total_users > 0 ? Math.round(Number(stats.total_xp) / stats.total_users).toLocaleString() : 0} avg/user</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🔥</span>
				<span class="stat-value">{stats.active_today}</span>
				<span class="stat-label">Active Today</span>
				<span class="stat-sub">{stats.total_users > 0 ? ((stats.active_today / stats.total_users) * 100).toFixed(1) : 0}% of users</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📅</span>
				<span class="stat-value">{stats.active_week}</span>
				<span class="stat-label">Active This Week</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🚀</span>
				<span class="stat-value">{stats.total_projects}</span>
				<span class="stat-label">Projects Done</span>
			</div>
		</div>

		<div class="charts-grid">
			<!-- Top Modules -->
			<div class="chart-card">
				<h2>📚 Top Modules by Completion</h2>
				{#if stats.module_stats?.length}
					<div class="bar-chart">
						{#each stats.module_stats as ms, i}
							{@const maxCount = Math.max(...stats.module_stats.map((m: any) => m.completions))}
							<div class="bar-row">
								<span class="bar-label">{ms.module_slug}</span>
								<div class="bar-track">
									<div class="bar-fill" style="width: {(ms.completions / maxCount) * 100}%"></div>
								</div>
								<span class="bar-value">{ms.completions}</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty">No data yet</p>
				{/if}
			</div>

			<!-- Badge Distribution -->
			<div class="chart-card">
				<h2>🏅 Badge Distribution</h2>
				{#if stats.badge_distribution?.length}
					<div class="badge-list">
						{#each stats.badge_distribution as b}
							<div class="badge-row">
								<span class="badge-name">{b.badge_id}</span>
								<span class="badge-count">{b.count} users</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="empty">No badges earned yet</p>
				{/if}
			</div>
		</div>

		<!-- Top Exercises -->
		<div class="chart-card full-width">
			<h2>🏋️ Most Submitted Exercises</h2>
			{#if stats.top_exercises?.length}
				<div class="exercise-grid">
					{#each stats.top_exercises as ex}
						<div class="exercise-stat">
							<span class="ex-name">{ex.exercise_slug}</span>
							<span class="ex-count">{ex.count} submissions</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty">No submissions yet</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.analytics-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
	.loading, .error-state { text-align: center; padding: 60px; color: var(--text-secondary); }
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}
	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 18px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}
	.stat-icon { font-size: 24px; }
	.stat-value { font-size: 22px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 11px; color: var(--text-secondary); }
	.stat-sub { font-size: 10px; color: var(--text-secondary); margin-top: 2px; }

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 20px;
	}
	.chart-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 18px;
	}
	.chart-card.full-width { grid-column: 1 / -1; }

	.bar-chart { display: flex; flex-direction: column; gap: 8px; }
	.bar-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
	.bar-label { min-width: 100px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.bar-track { flex: 1; height: 10px; background: var(--bg-secondary); border-radius: 5px; overflow: hidden; }
	.bar-fill { height: 100%; background: var(--accent); border-radius: 5px; transition: width 0.3s; }
	.bar-value { min-width: 30px; text-align: right; font-weight: 600; color: var(--accent); }

	.badge-list { display: flex; flex-direction: column; gap: 8px; }
	.badge-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
	.badge-row:last-child { border-bottom: none; }
	.badge-name { font-weight: 500; }
	.badge-count { font-size: 12px; color: var(--accent); font-weight: 600; }

	.exercise-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
	.exercise-stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 14px;
		background: var(--bg-secondary);
		border-radius: 8px;
		font-size: 13px;
	}
	.ex-name { font-weight: 500; }
	.ex-count { font-size: 12px; color: var(--accent); font-weight: 600; }

	.empty { color: var(--text-secondary); font-size: 13px; text-align: center; padding: 30px; }

	.btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--bg-secondary);
		color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
	}
	.btn-sm { padding: 5px 10px; font-size: 12px; }
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.charts-grid { grid-template-columns: 1fr; }
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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
			if (json.success) {
				stats = json.data;
			} else {
				error = json.error || 'Failed to load stats';
			}
		} catch (e) {
			error = 'Failed to load stats';
		} finally {
			loading = false;
		}
	}

	function timeAgo(dateStr: string) {
		const d = new Date(dateStr + 'Z');
		const now = new Date();
		const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
		if (sec < 60) return 'just now';
		if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
		if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
		return `${Math.floor(sec / 86400)}d ago`;
	}
</script>

<svelte:head>
	<title>📊 Admin Dashboard — RPL AI Curriculum</title>
</svelte:head>

{#if loading}
	<div class="loading">Loading dashboard data...</div>
{:else if error}
	<div class="error-state">
		<p class="error-msg">{error}</p>
		<button onclick={loadStats} class="btn">Retry</button>
	</div>
{:else if stats}
	<div class="dashboard">
		<div class="header-row">
			<h1>📊 Admin Dashboard</h1>
			<button onclick={loadStats} class="btn btn-sm">🔄 Refresh</button>
		</div>

		<!-- Stats Cards -->
		<div class="stats-grid">
			<div class="stat-card">
				<span class="stat-icon">👥</span>
				<span class="stat-value">{stats.total_users}</span>
				<span class="stat-label">Total Users</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✅</span>
				<span class="stat-value">{stats.total_sessions}</span>
				<span class="stat-label">Sessions Completed</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">✨</span>
				<span class="stat-value">{Number(stats.total_xp).toLocaleString()}</span>
				<span class="stat-label">Total XP Awarded</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🔥</span>
				<span class="stat-value">{stats.active_today}</span>
				<span class="stat-label">Active Today</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📅</span>
				<span class="stat-value">{stats.active_week}</span>
				<span class="stat-label">Active This Week</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🚀</span>
				<span class="stat-value">{stats.total_projects}</span>
				<span class="stat-label">Projects Completed</span>
			</div>
		</div>

		<!-- Quick Links -->
		<div class="quick-links">
			<h2>⚡ Quick Actions</h2>
			<div class="links-grid">
				<a href="/admin/content" class="quick-link">
					<span class="ql-icon">📚</span>
					<span class="ql-title">Manage Content</span>
					<span class="ql-desc">Edit modules, exercises, flashcards</span>
				</a>
				<a href="/admin/projects" class="quick-link">
					<span class="ql-icon">🚀</span>
					<span class="ql-title">Manage Projects</span>
					<span class="ql-desc">CRUD projects and steps</span>
				</a>
				<a href="/admin/users" class="quick-link">
					<span class="ql-icon">👥</span>
					<span class="ql-title">Manage Users</span>
					<span class="ql-desc">View users and progress</span>
				</a>
				<a href="/admin/analytics" class="quick-link">
					<span class="ql-icon">📈</span>
					<span class="ql-title">Analytics</span>
					<span class="ql-desc">Completion stats, XP distribution</span>
				</a>
			</div>
		</div>

		<!-- Recent Activity & Stats -->
		<div class="grid-2col">
			<!-- Recent Activity -->
			<div class="section">
				<h2>🕐 Recent Activity</h2>
				<div class="activity-list">
					{#if stats.recent_activity?.length}
						{#each stats.recent_activity.slice(0, 10) as act}
							<div class="activity-item">
								<span class="act-user">{act.username || act.user_id?.slice(0, 12)}</span>
								<span class="act-action">{act.action}</span>
								<span class="act-time">{timeAgo(act.created_at)}</span>
							</div>
						{/each}
					{:else}
						<p class="empty">No recent activity</p>
					{/if}
				</div>
			</div>

			<!-- Module Completion Stats -->
			<div class="section">
				<h2>📚 Top Modules</h2>
				<div class="module-stats">
					{#if stats.module_stats?.length}
						{#each stats.module_stats as ms}
							<div class="module-stat-row">
								<span class="ms-name">{ms.module_slug}</span>
								<div class="ms-bar-wrap">
									<div class="ms-bar" style="width: {Math.min(100, (ms.completions / Math.max(...stats.module_stats.map((m: any) => m.completions))) * 100)}%"></div>
								</div>
								<span class="ms-count">{ms.completions}</span>
							</div>
						{/each}
					{:else}
						<p class="empty">No module completions yet</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Recent Users -->
		<div class="section">
			<h2>👤 Recent Users</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Username</th>
							<th>Device ID</th>
							<th>Joined</th>
						</tr>
					</thead>
					<tbody>
						{#each stats.recent_users.slice(0, 15) as u}
							<tr>
								<td>{u.username}</td>
								<td class="mono">{u.id.slice(0, 16)}...</td>
								<td>{new Date(u.created_at).toLocaleDateString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}

<style>
	.loading, .error-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.error-msg { color: var(--danger); margin-bottom: 12px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

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
		gap: 4px;
	}
	.stat-icon { font-size: 24px; }
	.stat-value { font-size: 24px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 11px; color: var(--text-secondary); }

	.quick-links { margin-bottom: 28px; }
	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
	}
	.quick-link {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		text-decoration: none !important;
		transition: border-color 0.15s;
	}
	.quick-link:hover { border-color: var(--accent); }
	.ql-icon { font-size: 24px; }
	.ql-title { font-weight: 600; font-size: 14px; color: var(--text); }
	.ql-desc { font-size: 12px; color: var(--text-secondary); }

	.grid-2col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		margin-bottom: 28px;
	}

	.section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 20px;
	}

	.activity-list { display: flex; flex-direction: column; gap: 6px; }
	.activity-item {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 6px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.activity-item:last-child { border-bottom: none; }
	.act-user { font-weight: 600; color: var(--text); min-width: 80px; }
	.act-action { flex: 1; color: var(--text-secondary); }
	.act-time { color: var(--text-secondary); font-size: 11px; white-space: nowrap; }

	.module-stats { display: flex; flex-direction: column; gap: 6px; }
	.module-stat-row {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 13px;
	}
	.ms-name { min-width: 120px; font-weight: 500; }
	.ms-bar-wrap { flex: 1; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; }
	.ms-bar { height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.3s; }
	.ms-count { min-width: 30px; text-align: right; font-weight: 600; color: var(--accent); }

	.table-wrap { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	th { text-align: left; padding: 8px 10px; font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
	td { padding: 8px 10px; border-bottom: 1px solid var(--border); color: var(--text); }
	tr:last-child td { border-bottom: none; }
	.mono { font-family: monospace; font-size: 12px; }
	.empty { color: var(--text-secondary); font-size: 13px; padding: 20px 0; text-align: center; }

	.btn {
		display: inline-block; padding: 8px 16px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--bg-secondary);
		color: var(--text); font-size: 13px; font-weight: 500; cursor: pointer;
	}
	.btn-sm { padding: 6px 12px; font-size: 12px; }
	.btn:hover { opacity: 0.85; }

	@media (max-width: 768px) {
		.grid-2col { grid-template-columns: 1fr; }
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}
</style>

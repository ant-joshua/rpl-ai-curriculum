<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Card, CardContent, Alert } from '$lib/components/ui';

	let loading = $state(true);
	let error = $state('');

	let activeTab = $state('overview');

	// Overview data
	let overview: any = $state(null);
	// Enrollment trend data
	let enrollments: any[] = $state([]);
	// Completion data
	let completion: any[] = $state([]);

	onMount(() => {
		if (!browser) return;
		loadAll();
	});

	async function loadAll() {
		loading = true;
		error = '';
		try {
			const [ovRes, enRes, coRes] = await Promise.all([
				fetch('/api/admin/analytics/overview'),
				fetch('/api/admin/analytics/enrollments'),
				fetch('/api/admin/analytics/completion'),
			]);
			const ov = await ovRes.json();
			const en = await enRes.json();
			const co = await coRes.json();
			if (ov.success) overview = ov.data;
			else { error = ov.error || 'Failed'; loading = false; return; }
			if (en.success) enrollments = en.data || [];
			if (co.success) completion = co.data || [];
		} catch { error = 'Failed to load'; }
		finally { loading = false; }
	}

	function timeAgo(dateStr: string) {
		const d = new Date(dateStr + 'Z');
		const now = new Date();
		const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
		if (sec < 60) return 'just now';
		if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
		if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
		if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
		return d.toLocaleDateString();
	}

	function actionIcon(action: string) {
		if (action.includes('lesson') || action.includes('view')) return '👁️';
		if (action.includes('complete')) return '✅';
		if (action.includes('thread') || action.includes('discuss')) return '💬';
		if (action.includes('reply')) return '↩️';
		if (action.includes('assess') || action.includes('submit')) return '📝';
		if (action.includes('enroll')) return '📋';
		return '🔔';
	}

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: '📊' },
		{ id: 'enrollments', label: 'Enrollments', icon: '📈' },
		{ id: 'completion', label: 'Completion', icon: '✅' },
		{ id: 'activity', label: 'Activity', icon: '🕐' },
	];
</script>

<svelte:head>
	<title>📈 Analytics — Admin</title>
</svelte:head>

<div class="analytics-page">
	<div class="header-row">
		<h1>📈 Analytics</h1>
		<Button size="sm" onclick={loadAll}>🔄 Refresh</Button>
	</div>

	<!-- Tabs -->
	<div class="tabs">
		{#each tabs as tab}
			<button
				class="tab"
				class:tab--active={activeTab === tab.id}
				onclick={() => activeTab = tab.id}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span>{tab.label}</span>
			</button>
		{/each}
	</div>

	{#if loading}
		<div class="loading">Loading analytics...</div>
	{:else if error}
		<div class="error-state">
			<Alert variant="danger">{error}</Alert>
			<Button onclick={loadAll}>Retry</Button>
		</div>
	{:else}

		<!-- === OVERVIEW TAB === -->
		{#if activeTab === 'overview'}
			<div class="stats-grid">
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">👥</span>
						<span class="stat-value">{overview?.totalUsers ?? 0}</span>
						<span class="stat-label">Total Users</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📋</span>
						<span class="stat-value">{overview?.activeEnrollments ?? 0}</span>
						<span class="stat-label">Active Enrollments</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📚</span>
						<span class="stat-value">{overview?.totalCourses ?? 0}</span>
						<span class="stat-label">Total Courses</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">📖</span>
						<span class="stat-value">{overview?.totalLessons ?? 0}</span>
						<span class="stat-label">Published Lessons</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">⏳</span>
						<span class="stat-value">{overview?.pendingGrades ?? 0}</span>
						<span class="stat-label">Pending Grades</span>
					</CardContent>
				</Card>
				<Card class="stat-card">
					<CardContent>
						<span class="stat-icon">🆕</span>
						<span class="stat-value">{overview?.newUsers ?? 0}</span>
						<span class="stat-label">New Users (7d)</span>
					</CardContent>
				</Card>
			</div>

			<Card class="section-card">
				<CardContent>
					<h2>Recent Activity</h2>
					{#if overview?.recentActivity?.length}
						<div class="activity-feed">
							{#each overview.recentActivity.slice(0, 10) as act}
								<div class="activity-item">
									<span class="act-avatar">
										{act.avatar_url
											? `<img src="${act.avatar_url}" alt="" class="act-img" />`
											: '👤'}
									</span>
									<div class="act-body">
										<span class="act-user">{act.display_name || act.email || act.user_id?.slice(0, 12)}</span>
										<span class="act-action">{act.action}</span>
										{#if act.entity_type}
											<span class="act-entity">on {act.entity_type} {act.entity_id?.slice(0, 12)}</span>
										{/if}
									</div>
									<span class="act-time">{timeAgo(act.created_at)}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">No recent activity</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === ENROLLMENTS TAB === -->
		{:else if activeTab === 'enrollments'}
			<Card class="section-card">
				<CardContent>
					<h2>Enrollment Trend — Last 30 Days</h2>
					{#if enrollments.length > 0}
						{@const maxVal = Math.max(...enrollments.map((e: any) => e.count), 1)}
						{@const chartW = 700}
						{@const chartH = 250}
						{@const barW = Math.max(8, Math.min(20, (chartW - 40) / enrollments.length))}
						{@const gap = 2}
						<div class="svg-chart-wrap">
							<svg viewBox="0 0 {chartW} {chartH + 40}" class="bar-svg">
								<!-- Y axis labels -->
								<text x="10" y="15" class="chart-label">{maxVal}</text>
								<text x="10" y={chartH / 2 + 5} class="chart-label">{Math.round(maxVal / 2)}</text>
								<text x="10" y={chartH + 5} class="chart-label">0</text>
								<!-- Bars -->
								{#each enrollments as item, i}
									{@const barH = (item.count / maxVal) * chartH}
									{@const x = 35 + i * (barW + gap)}
									{@const y = chartH - barH}
									<rect
										x={x} y={y}
										width={barW} height={barH}
										rx="2" ry="2"
										class="bar-rect"
									>
										<title>{item.date}: {item.count} enrollments</title>
									</rect>
									<!-- Date label every 5th bar -->
									{#if i % 5 === 0}
										<text x={x + barW / 2} y={chartH + 16} text-anchor="middle" class="chart-label-x">
											{item.date?.slice(5)}
										</text>
									{/if}
								{/each}
							</svg>
						</div>
					{:else}
						<p class="empty">No enrollment data yet</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === COMPLETION TAB === -->
		{:else if activeTab === 'completion'}
			<Card class="section-card">
				<CardContent>
					<h2>Lesson Completion Rates per Offering</h2>
					{#if completion.length > 0}
						{@const maxRate = Math.max(...completion.map((c: any) => c.completion_rate), 0.01)}
						<div class="completion-list">
							{#each completion as item}
								{@const pct = (item.completion_rate / maxRate) * 100}
								{@const pctDisplay = (item.completion_rate * 100).toFixed(1)}
								<div class="comp-row">
									<div class="comp-info">
										<span class="comp-name">{item.offering_name}</span>
										<span class="comp-students">{item.active_students} students</span>
									</div>
									<div class="comp-bar-track">
										<div
											class="comp-bar-fill"
											style="width: {pct}%"
											style:background={item.completion_rate >= 0.7 ? 'var(--accent)' : item.completion_rate >= 0.4 ? '#f59e0b' : '#ef4444'}
										></div>
									</div>
									<span class="comp-pct">{pctDisplay}%</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">No completion data yet</p>
					{/if}
				</CardContent>
			</Card>

		<!-- === ACTIVITY TAB === -->
		{:else if activeTab === 'activity'}
			<Card class="section-card">
				<CardContent>
					<h2>Activity Log</h2>
					{#if overview?.recentActivity?.length}
						<div class="activity-feed activity-feed--full">
							{#each overview.recentActivity as act}
								<div class="activity-item">
									<span class="act-avatar">{actionIcon(act.action)}</span>
									<div class="act-body">
										<span class="act-user">{act.display_name || act.email || act.user_id?.slice(0, 12)}</span>
										<span class="act-action">{act.action}</span>
										{#if act.entity_type}
											<span class="act-entity">· {act.entity_type} {act.entity_id?.slice(0, 8)}</span>
										{/if}
									</div>
									<span class="act-time">{timeAgo(act.created_at)}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="empty">No activity logged yet</p>
					{/if}
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.analytics-page { max-width: 1100px; }
	h1 { font-size: 26px; font-weight: 700; }
	h2 { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
	.loading { text-align: center; padding: 60px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 60px; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 16px; }
	.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }

	/* Tabs */
	.tabs {
		display: flex;
		gap: 4px;
		margin-bottom: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 4px;
		overflow-x: auto;
	}
	.tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}
	.tab:hover { background: var(--bg-secondary); color: var(--text); }
	.tab--active { background: var(--accent-dim); color: var(--accent); font-weight: 600; }
	.tab-icon { font-size: 16px; }

	/* Stats cards */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 14px;
		margin-bottom: 28px;
	}
	:global(.stat-card) { text-align: center; }
	:global(.stat-card) :global(.card-content) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 18px;
	}
	.stat-icon { font-size: 24px; }
	.stat-value { font-size: 22px; font-weight: 700; color: var(--accent); }
	.stat-label { font-size: 11px; color: var(--text-secondary); }

	/* Section card */
	:global(.section-card) { margin-bottom: 20px; }

	/* SVG bar chart */
	.svg-chart-wrap {
		width: 100%;
		overflow-x: auto;
	}
	.bar-svg {
		width: 100%;
		min-width: 300px;
		height: auto;
	}
	.bar-rect {
		fill: var(--accent);
		opacity: 0.85;
		transition: opacity 0.2s;
	}
	.bar-rect:hover { opacity: 1; }
	.chart-label {
		fill: var(--text-secondary);
		font-size: 10px;
		font-family: inherit;
	}
	.chart-label-x {
		fill: var(--text-secondary);
		font-size: 9px;
		font-family: inherit;
	}

	/* Completion bars */
	.completion-list { display: flex; flex-direction: column; gap: 10px; }
	.comp-row { display: flex; align-items: center; gap: 12px; }
	.comp-info { min-width: 180px; }
	.comp-name { display: block; font-size: 13px; font-weight: 500; }
	.comp-students { font-size: 11px; color: var(--text-secondary); }
	.comp-bar-track { flex: 1; height: 12px; background: var(--bg-secondary); border-radius: 6px; overflow: hidden; }
	.comp-bar-fill { height: 100%; border-radius: 6px; transition: width 0.3s; }
	.comp-pct { min-width: 45px; text-align: right; font-size: 13px; font-weight: 600; color: var(--accent); }

	/* Activity feed */
	.activity-feed { display: flex; flex-direction: column; gap: 2px; }
	.activity-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 13px;
	}
	.activity-item:last-child { border-bottom: none; }
	.act-avatar { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
	.act-body { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; }
	.act-user { font-weight: 600; color: var(--text); }
	.act-action { color: var(--text-secondary); }
	.act-entity { color: var(--text-secondary); font-size: 12px; }
	.act-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }

	.empty { color: var(--text-secondary); font-size: 13px; text-align: center; padding: 30px; }

	@media (max-width: 768px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
		.comp-info { min-width: 120px; }
	}
</style>

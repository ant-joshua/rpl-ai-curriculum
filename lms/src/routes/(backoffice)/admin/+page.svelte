<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/stores/i18n';
	import { Skeleton } from '$lib/components/ui';

	interface ActivityItem {
		id?: string | number;
		user_name?: string;
		action?: string;
		timestamp?: string;
		[key: string]: unknown;
	}

	interface OverviewData {
		totalUsers: number;
		activeEnrollments: number;
		totalCourses: number;
		totalLessons: number;
		pendingGrades: number;
		newUsers: number;
		recentActivity: ActivityItem[];
	}

	let data = $state<OverviewData | null>(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const res = await fetch('/api/admin/analytics/overview');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			data = await res.json();
		} catch (e: any) {
			error = e?.message ?? 'Failed to load';
		} finally {
			loading = false;
		}
	});

	function fmtDate(iso?: string): string {
		if (!iso) return '';
		try {
			const d = new Date(iso);
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
		} catch {
			return iso;
		}
	}

	const quickLinks = [
		{ href: '/admin/attendance', icon: '📅', label: 'Attendance' },
		{ href: '/admin/gradebook', icon: '🎓', label: 'Gradebook' },
		{ href: '/admin/announcements', icon: '📢', label: 'Announcements' },
		{ href: '/admin/analytics', icon: '📊', label: 'Analytics' },
		{ href: '/admin/enrollments', icon: '📋', label: 'Enrollments' },
		{ href: '/admin/exports', icon: '📤', label: 'Exports' },
	];
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="dash-page">
	<h1>{t('admin.dashboard')}</h1>
	<p class="subtitle">{t('admin.welcome')}</p>

	{#if error}
		<p class="error-msg">{error}</p>
	{/if}

	<!-- Stat Cards -->
	<div class="stats-grid">
		{#if loading}
			{#each Array(6) as _}
				<div class="stat-card">
					<Skeleton variant="text" width="60px" height="12px" />
					<Skeleton variant="title" width="80px" height="28px" />
				</div>
			{/each}
		{:else if data}
			<div class="stat-card">
				<span class="stat-icon">👥</span>
				<span class="stat-number">{data.totalUsers.toLocaleString()}</span>
				<span class="stat-label">Total Users</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📋</span>
				<span class="stat-number">{data.activeEnrollments.toLocaleString()}</span>
				<span class="stat-label">Active Enrollments</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📚</span>
				<span class="stat-number">{data.totalCourses.toLocaleString()}</span>
				<span class="stat-label">Total Courses</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">📝</span>
				<span class="stat-number">{data.totalLessons.toLocaleString()}</span>
				<span class="stat-label">Published Lessons</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">⏳</span>
				<span class="stat-number">{data.pendingGrades.toLocaleString()}</span>
				<span class="stat-label">Pending Grades</span>
			</div>
			<div class="stat-card">
				<span class="stat-icon">🆕</span>
				<span class="stat-number">{data.newUsers.toLocaleString()}</span>
				<span class="stat-label">New Users (7d)</span>
			</div>
		{/if}
	</div>

	<!-- Recent Activity -->
	<div class="section">
		<h2 class="section-title">Recent Activity</h2>
		{#if loading}
			<Skeleton variant="table-row" count={5} gap="8px" />
		{:else if data?.recentActivity?.length}
			<div class="activity-list">
				{#each data.recentActivity.slice(0, 10) as item}
					<div class="activity-row">
						<span class="activity-user">{item.user_name ?? 'System'}</span>
						<span class="activity-action">{item.action ?? ''}</span>
						<span class="activity-time">{fmtDate(item.timestamp)}</span>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-text">No recent activity</p>
		{/if}
	</div>

	<!-- Quick Links -->
	<div class="section">
		<h2 class="section-title">Quick Links</h2>
		<div class="links-grid">
			{#each quickLinks as link}
				<a href={link.href} class="link-card">
					<span class="link-icon">{link.icon}</span>
					<span class="link-label">{link.label}</span>
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.dash-page {
		max-width: 900px;
		padding: 24px;
	}

	h1 {
		font-size: 26px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 28px;
	}

	.error-msg {
		color: var(--danger);
		font-size: 14px;
		margin-bottom: 20px;
		padding: 12px;
		border: 1px solid var(--danger);
		border-radius: 8px;
		background: var(--surface);
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 18px 16px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.stat-icon {
		font-size: 20px;
		line-height: 1;
	}

	.stat-number {
		font-size: 28px;
		font-weight: 700;
		color: var(--text);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 13px;
		color: var(--text-muted);
	}

	/* Sections */
	.section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
	}

	/* Activity */
	.activity-list {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
	}

	.activity-row {
		display: grid;
		grid-template-columns: 140px 1fr auto;
		gap: 12px;
		padding: 10px 16px;
		font-size: 13px;
		border-bottom: 1px solid var(--border);
		align-items: center;
	}

	.activity-row:last-child {
		border-bottom: none;
	}

	.activity-user {
		font-weight: 500;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.activity-action {
		color: var(--text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.activity-time {
		color: var(--text-muted);
		white-space: nowrap;
		font-size: 12px;
	}

	.empty-text {
		color: var(--text-muted);
		font-size: 14px;
		padding: 20px;
		text-align: center;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	/* Quick Links */
	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
	}

	.link-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		text-decoration: none;
		color: var(--text);
		transition: border-color 0.15s;
	}

	.link-card:hover {
		border-color: var(--accent);
	}

	.link-icon {
		font-size: 24px;
		line-height: 1;
	}

	.link-label {
		font-size: 13px;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.activity-row {
			grid-template-columns: 100px 1fr auto;
			font-size: 12px;
		}

		.links-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 480px) {
		.dash-page {
			padding: 16px;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

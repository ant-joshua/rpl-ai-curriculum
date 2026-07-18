<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { gamification } from '$lib/stores/gamification.svelte';
	import { modules } from '$lib/stores/modules';
	import { api, getDeviceId } from '$lib/utils/api';
	import { StatCard } from '$lib/components/ui';
	import ShareButton from '$lib/components/ShareButton.svelte';

	let userData = $state<{ username: string; created_at: string } | null>(null);
	let activityData = $state<Array<{ module_slug: string | null; session_id: string | null; action: string; created_at: string }>>([]);
	let loading = $state(true);

	let stats = $derived(gamification.computeStats());
	let badges = $derived(gamification.unlockedBadges);
	let levelInfo = $derived(gamification.getLevelProgress());

	let overallPct = $derived(progress.getOverallProgress());

	// Completion rate for progress bar
	let completionPct = $derived(overallPct);

	let isOnTrack = $derived(completionPct >= stats.streak * 2 || stats.streak >= 3);

	onMount(async () => {
		// Fetch user info
		const userRes = await api<{ username: string; created_at: string }>('/api/user');
		if (userRes.success && userRes.data) {
			userData = userRes.data;
		}

		// Fetch activity
		const actRes = await api<Array<{ module_slug: string | null; session_id: string | null; action: string; created_at: string }>>('/api/activity?limit=20');
		if (actRes.success && actRes.data) {
			activityData = actRes.data;
		}

		loading = false;
	});

	function formatDate(iso: string): string {
		try {
			const d = new Date(iso + 'Z');
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
		} catch {
			return iso;
		}
	}

	function timeAgo(iso: string): string {
		try {
			const d = new Date(iso + 'Z');
			const now = new Date();
			const diff = now.getTime() - d.getTime();
			if (diff < 60000) return ''+t('profile.time_just_now')+'';
			if (diff < 3600000) return `{t('profile.time_min_ago', { m: Math.floor(diff / 60000) })}`;
			if (diff < 86400000) return `{t('profile.time_hour_ago', { j: Math.floor(diff / 3600000) })}`;
			return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
		} catch {
			return iso;
		}
	}

	function getModuleTitle(slug: string | null): string {
		if (!slug) return '—';
		const mod = modules.find(m => m.slug === slug);
		return mod?.title || slug;
	}
</script>

<div class="profile-page">
	{#if loading}
		<div class="loading-state">{t('profile.loading')}</div>
	{:else}
		<!-- User Stats Card -->
		<div class="stats-card">
			<div class="profile-header">
				<div class="profile-avatar-large">
					{(userData?.username || getDeviceId()).charAt(0).toUpperCase()}
				</div>
				<div class="profile-info">
					<h1>{userData?.username || t('profile.default_name')}</h1>
					<p class="profile-device">📱 {getDeviceId().slice(0, 12)}...</p>
					<p class="profile-joined">{t('profile.joined', { date: userData?.created_at ? formatDate(userData.created_at) : '—' })}</p>
				</div>
				<div class="level-badge">
					<span class="level-number">Lv.{levelInfo.level}</span>
					<span class="level-xp">{levelInfo.currentXp}/{levelInfo.currentXp + levelInfo.xpToNext} XP</span>
				</div>
			</div>
			<div class="stats-grid">
				<StatCard icon="✅" value={stats.completedSessions} label="{t('profile.sessions_completed')}" />
				<StatCard icon="📋" value={stats.totalSessions} label="{t('profile.total_sessions')}" />
				<StatCard icon="📦" value="{stats.modulesCompleted}/{modules.length}" label="{t('profile.modules_completed')}" />
				<StatCard icon="🔥" value={stats.streak} label="{t('profile.daily_streak')}" />
				<StatCard icon="📅" value={stats.daysActive} label="{t('profile.active_days')}" />
				<StatCard icon="✨" value={gamification.xp} label="{t('profile.total_xp')}" />
			</div>
		</div>

		<!-- Progress Summary -->
		<div class="section-card">
			<h2>{t('profile.progress')}</h2>
			<div class="share-row">
				<ShareButton
					title={t('profile.share_title', { name: userData?.username || t('profile.default_name') })}
					text={t('profile.share_text', { count: stats.completedSessions })}
					url={typeof window !== 'undefined' ? window.location.href : ''}
				/>
			</div>
			<div class="progress-bar-wrapper">
				<div class="completion-bar">
					<div class="completion-fill" style="width: {completionPct}%"></div>
				</div>
				<span class="completion-label">{t('profile.pct_complete', { pct: completionPct })}</span>
			</div>
			<div class="mini-stats">
				<span>{t('profile.sessions_of_total', { done: stats.completedSessions, total: stats.totalSessions })}</span>
				<span>{t('profile.modules_of_total', { done: stats.modulesCompleted, total: modules.length })}</span>
			</div>
		</div>

		<!-- Badge Showcase -->
		<div class="section-card">
			<h2>{t('profile.badges_section', { count: badges.length })}</h2>
			{#if badges.length === 0}
				<p class="empty-state">{t('profile.badges_empty')}</p>
			{:else}
				<div class="badge-grid">
					{#each badges as badge}
						<div class="badge-item" title={badge.description}>
							<span class="badge-icon">{badge.icon}</span>
							<span class="badge-name">{badge.name}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Activity Timeline -->
		<div class="section-card">
			<h2>{t('profile.recent_activity')}</h2>
			{#if activityData.length === 0}
				<p class="empty-state">{t('profile.no_activity')}</p>
			{:else}
				<div class="timeline">
					{#each activityData.filter(a => a.action === 'complete') as act}
						<div class="timeline-item">
							<div class="timeline-dot complete"></div>
							<div class="timeline-content">
								<span class="timeline-action">{t('profile.action_complete')}</span>
								<span class="timeline-module">{getModuleTitle(act.module_slug)}</span>
								<span class="timeline-time">{timeAgo(act.created_at)}</span>
							</div>
						</div>
					{/each}
					{#each activityData.filter(a => a.action === 'view') as act}
						<div class="timeline-item">
							<div class="timeline-dot view"></div>
							<div class="timeline-content">
								<span class="timeline-action">{t('profile.action_view')}</span>
								<span class="timeline-module">{getModuleTitle(act.module_slug)}</span>
								<span class="timeline-time">{timeAgo(act.created_at)}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Motivational Message -->
		<div class="motivation-card">
			{#if isOnTrack}
				<p>{t('profile.motivation_ontrack')}</p>
			{:else}
				<p>{t('profile.motivation_offtrack')}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.profile-page {
		max-width: 720px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.loading-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.stats-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 20px;
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
	}

	.profile-avatar-large {
		width: 64px;
		height: 64px;
		min-width: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26px;
		font-weight: 700;
	}

	.profile-info {
		flex: 1;
	}

	.profile-info h1 {
		font-size: 22px;
		font-weight: 700;
		margin: 0 0 4px;
	}

	.profile-device, .profile-joined {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 2px 0;
	}

	.level-badge {
		text-align: center;
		padding: 8px 16px;
		border: 1px solid var(--accent);
		border-radius: 12px;
		background: var(--accent-dim);
	}
	.level-number {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: var(--accent);
	}
	.level-xp {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.section-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.section-card h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.share-row {
		margin-bottom: 12px;
		display: flex;
		justify-content: flex-end;
	}

	.progress-bar-wrapper {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
	}

	.completion-bar {
		flex: 1;
		height: 12px;
		background: var(--bg-secondary);
		border-radius: 6px;
		overflow: hidden;
	}
	.completion-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 6px;
		transition: width 0.4s ease;
	}
	.completion-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--accent);
		min-width: 80px;
		text-align: right;
	}

	.mini-stats {
		display: flex;
		gap: 16px;
		font-size: 12px;
		color: var(--text-secondary);
	}

	.badge-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
		gap: 10px;
	}
	.badge-item {
		text-align: center;
		padding: 12px 8px;
		background: var(--bg-secondary);
		border-radius: 10px;
		transition: transform 0.15s ease;
	}
	.badge-item:hover {
		transform: scale(1.05);
	}
	.badge-icon {
		font-size: 28px;
		display: block;
		margin-bottom: 4px;
	}
	.badge-name {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.timeline-item {
		display: flex;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
		align-items: flex-start;
	}
	.timeline-item:last-child {
		border-bottom: none;
	}
	.timeline-dot {
		width: 10px;
		height: 10px;
		min-width: 10px;
		border-radius: 50%;
		margin-top: 5px;
	}
	.timeline-dot.complete { background: #22c55e; }
	.timeline-dot.view { background: var(--accent); }
	.timeline-content {
		flex: 1;
	}
	.timeline-action {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
	}
	.timeline-module {
		font-size: 12px;
		color: var(--text-secondary);
	}
	.timeline-time {
		font-size: 11px;
		color: var(--text-secondary);
	}

	.motivation-card {
		background: linear-gradient(135deg, var(--accent-dim), var(--bg-secondary));
		border: 1px solid var(--accent);
		border-radius: 12px;
		padding: 16px 20px;
		text-align: center;
	}
	.motivation-card p {
		font-size: 14px;
		font-weight: 500;
		color: var(--accent);
		margin: 0;
	}

	.empty-state {
		color: var(--text-secondary);
		font-size: 13px;
		text-align: center;
		padding: 20px;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr) !important;
		}
		.profile-header {
			flex-direction: column;
			text-align: center;
		}
		.profile-info h1 {
			font-size: 18px;
		}
		.level-badge {
			margin-top: 8px;
		}
		.mini-stats {
			flex-direction: column;
			gap: 4px;
		}
		.profile-page {
			padding: 12px 0;
		}
	}
</style>

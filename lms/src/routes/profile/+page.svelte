<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { gamification } from '$lib/stores/gamification.svelte';
	import { modules } from '$lib/stores/modules';
	import { api, getDeviceId } from '$lib/utils/api';
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
			if (diff < 60000) return 'baru saja';
			if (diff < 3600000) return `${Math.floor(diff / 60000)}m lalu`;
			if (diff < 86400000) return `${Math.floor(diff / 3600000)}j lalu`;
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
		<div class="loading-state">Memuat profil...</div>
	{:else}
		<!-- User Stats Card -->
		<div class="stats-card">
			<div class="profile-header">
				<div class="profile-avatar-large">
					{(userData?.username || getDeviceId()).charAt(0).toUpperCase()}
				</div>
				<div class="profile-info">
					<h1>{userData?.username || 'Pengguna'}</h1>
					<p class="profile-device">📱 {getDeviceId().slice(0, 12)}...</p>
					<p class="profile-joined">Bergabung {userData?.created_at ? formatDate(userData.created_at) : '—'}</p>
				</div>
				<div class="level-badge">
					<span class="level-number">Lv.{levelInfo.level}</span>
					<span class="level-xp">{levelInfo.currentXp}/{levelInfo.currentXp + levelInfo.xpToNext} XP</span>
				</div>
			</div>
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-value">{stats.completedSessions}</span>
					<span class="stat-label">Sesi Selesai</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{stats.totalSessions}</span>
					<span class="stat-label">Total Sesi</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{stats.modulesCompleted}/{modules.length}</span>
					<span class="stat-label">Modul Selesai</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{stats.streak} 🔥</span>
					<span class="stat-label">Daily Streak</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{stats.daysActive}</span>
					<span class="stat-label">Hari Aktif</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{gamification.xp} ✨</span>
					<span class="stat-label">Total XP</span>
				</div>
			</div>
		</div>

		<!-- Progress Summary -->
		<div class="section-card">
			<h2>📊 Progress</h2>
			<div class="share-row">
				<ShareButton
					title="Progres RPL AI - {userData?.username || 'Pengguna'}"
					text="Aku sudah menyelesaikan {stats.completedSessions} sesi di RPL AI Curriculum! 🎯"
					url={typeof window !== 'undefined' ? window.location.href : ''}
				/>
			</div>
			<div class="progress-bar-wrapper">
				<div class="completion-bar">
					<div class="completion-fill" style="width: {completionPct}%"></div>
				</div>
				<span class="completion-label">{completionPct}% selesai</span>
			</div>
			<div class="mini-stats">
				<span>✅ {stats.completedSessions} sesi dari {stats.totalSessions}</span>
				<span>📦 {stats.modulesCompleted} modul dari {modules.length}</span>
			</div>
		</div>

		<!-- Badge Showcase -->
		<div class="section-card">
			<h2>🏅 Badge ({badges.length})</h2>
			{#if badges.length === 0}
				<p class="empty-state">Selesaikan sesi untuk membuka badge!</p>
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
			<h2>📜 Aktivitas Terakhir</h2>
			{#if activityData.length === 0}
				<p class="empty-state">Belum ada aktivitas</p>
			{:else}
				<div class="timeline">
					{#each activityData.filter(a => a.action === 'complete') as act}
						<div class="timeline-item">
							<div class="timeline-dot complete"></div>
							<div class="timeline-content">
								<span class="timeline-action">✅ Menyelesaikan sesi</span>
								<span class="timeline-module">{getModuleTitle(act.module_slug)}</span>
								<span class="timeline-time">{timeAgo(act.created_at)}</span>
							</div>
						</div>
					{/each}
					{#each activityData.filter(a => a.action === 'view') as act}
						<div class="timeline-item">
							<div class="timeline-dot view"></div>
							<div class="timeline-content">
								<span class="timeline-action">📖 Melihat</span>
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
				<p>✅ Semua baik! Kamu on track dengan progress belajar. Tetap semangat! 🚀</p>
			{:else}
				<p>💪 Yuk lanjutkan belajar! Setiap sesi membawamu lebih dekat ke tujuan. 🎯</p>
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

	.stat-item {
		text-align: center;
		padding: 12px;
		background: var(--bg-secondary);
		border-radius: 10px;
	}
	.stat-value {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: var(--accent);
	}
	.stat-label {
		font-size: 11px;
		color: var(--text-secondary);
		margin-top: 2px;
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

<script lang="ts">
	import { browser } from '$app/environment';
	import { user } from '$lib/stores/user.svelte';
	import { fade } from 'svelte/transition';
	import { getDeviceId } from '$lib/utils/api';

	let loading = $state(true);
	let entries = $state<Array<{ user_id: string; xp: number; level: number; badge_count: number }>>([]);
	let currentUserId = $state('');
	let activeTab = $state<'global' | 'path'>('global');
	let pathSlug = $state('');

	let paths = $state<Array<{ slug: string; title: string }>>([]);

	$effect(() => {
		async function load() {
			loading = true;
			currentUserId = getDeviceId();
			const deviceId = currentUserId;
			const params = new URLSearchParams({ current_device: deviceId });
			if (activeTab === 'path' && pathSlug) {
				params.set('path_slug', pathSlug);
			}
			try {
				const res = await fetch(`/api/leaderboard?${params.toString()}`);
				const json = await res.json();
				if (json.success) {
					entries = json.data || [];
				}
			} catch (e) {
				console.error('Failed to load leaderboard', e);
			} finally {
				loading = false;
			}
		}
		load();
	});

	function rankClass(rank: number): string {
		if (rank === 1) return 'rank-gold';
		if (rank === 2) return 'rank-silver';
		if (rank === 3) return 'rank-bronze';
		return '';
	}

	function rankIcon(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `#${rank}`;
	}

	function formatUserId(id: string): string {
		if (id === currentUserId) return 'Kamu';
		return id.slice(0, 12) + '...';
	}
</script>

<svelte:head>
	<title>🏆 Papan Peringkat — RPL AI Curriculum</title>
</svelte:head>

<div class="leaderboard-page">
	<h1 class="page-title">🏆 Papan Peringkat</h1>
	<p class="page-subtitle">Top users ranked by XP — terus belajar untuk naik peringkat!</p>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'global'}
			onclick={() => { activeTab = 'global'; }}
		>🌍 Global</button>
		<button
			class="tab"
			class:active={activeTab === 'path'}
			onclick={() => { activeTab = 'path'; }}
		>📚 Per Path</button>
	</div>

	{#if activeTab === 'path'}
		<div class="path-selector">
			<select bind:value={pathSlug} onchange={() => { if (pathSlug) activeTab = 'path'; }}>
				<option value="">Pilih Path</option>
				{#each paths as p}
					<option value={p.slug}>{p.title}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="leaderboard-content">
		{#if loading}
			<div class="loading-state" in:fade={{ duration: 150 }}>
				<div class="skeleton-list">
					{#each [1, 2, 3, 4, 5] as _}
						<div class="skeleton-row">
							<div class="skeleton-avatar"></div>
							<div class="skeleton-lines">
								<div class="skeleton-line" style="width: 60%"></div>
								<div class="skeleton-line" style="width: 40%"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if entries.length === 0}
			<div class="empty-state">
				<span class="empty-icon">🏆</span>
				<p>Belum ada data peringkat.</p>
				<p class="empty-hint">Selesaikan sesi untuk mendapat XP dan muncul di papan peringkat!</p>
			</div>
		{:else}
			<div class="leaderboard-list">
				{#each entries as entry, i}
					<div
						class="leaderboard-row"
						class:is-current={entry.user_id === currentUserId}
						in:fade={{ duration: 200, delay: i * 30 }}
					>
						<div class="rank-cell {rankClass(i + 1)}">
							<span class="rank-number">{rankIcon(i + 1)}</span>
						</div>
						<div class="user-cell">
							<div class="user-avatar">
								{formatUserId(entry.user_id).charAt(0).toUpperCase()}
							</div>
							<div class="user-info">
								<span class="user-name">
									{formatUserId(entry.user_id)}
									{#if entry.user_id === currentUserId}
										<span class="you-badge">Kamu</span>
									{/if}
								</span>
								<span class="user-level">Level {entry.level}</span>
							</div>
						</div>
						<div class="stats-cell">
							<span class="stat-xp">
								<span class="stat-value">{entry.xp.toLocaleString()}</span>
								<span class="stat-label">XP</span>
							</span>
							<span class="stat-badges">
								<span class="stat-value">{entry.badge_count}</span>
								<span class="stat-label">Badges</span>
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.leaderboard-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 24px 0;
	}

	.page-title {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
		color: var(--text);
	}

	.page-subtitle {
		color: var(--text-secondary);
		font-size: 14px;
		margin-bottom: 24px;
	}

	.tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}

	.tab {
		padding: 8px 20px;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.15s ease;
	}

	.tab:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.tab.active {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}

	.path-selector {
		margin-bottom: 16px;
	}

	.path-selector select {
		width: 100%;
		max-width: 300px;
		padding: 8px 12px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
		cursor: pointer;
	}

	.loading-state {
		padding: 20px 0;
	}

	.skeleton-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
	}

	.skeleton-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #1e2240;
		position: relative;
		overflow: hidden;
	}

	.skeleton-avatar::after,
	.skeleton-line::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent 0%, #2a2f52 25%, transparent 50%);
		background-size: 200% 100%;
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.skeleton-line {
		height: 14px;
		border-radius: 6px;
		background: #1e2240;
		position: relative;
		overflow: hidden;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80px 24px;
		text-align: center;
		color: var(--text-secondary);
		gap: 8px;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 8px;
	}

	.empty-hint {
		font-size: 13px;
		opacity: 0.7;
	}

	.leaderboard-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.leaderboard-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.15s ease;
	}

	.leaderboard-row:hover {
		border-color: var(--accent-dim);
	}

	.leaderboard-row.is-current {
		background: var(--accent-dim);
		border-color: var(--accent);
	}

	.rank-cell {
		min-width: 48px;
		text-align: center;
	}

	.rank-number {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-secondary);
	}

	.rank-gold .rank-number { color: #f59e0b; font-size: 20px; }
	.rank-silver .rank-number { color: #94a3b8; font-size: 18px; }
	.rank-bronze .rank-number { color: #d97706; font-size: 18px; }

	.user-cell {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		min-width: 40px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: 700;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.user-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.you-badge {
		display: inline-block;
		font-size: 10px;
		font-weight: 600;
		background: var(--accent);
		color: #fff;
		padding: 1px 6px;
		border-radius: 4px;
		margin-left: 6px;
		vertical-align: middle;
	}

	.user-level {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.stats-cell {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.stat-xp, .stat-badges {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.stat-value {
		font-size: 15px;
		font-weight: 700;
		color: var(--text);
	}

	.stat-label {
		font-size: 10px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	@media (max-width: 768px) {
		.leaderboard-page {
			padding: 16px 0;
		}
		.page-title {
			font-size: 22px;
		}
		.tabs {
			gap: 6px;
		}
		.tab {
			padding: 6px 14px;
			font-size: 13px;
		}
		.leaderboard-row {
			padding: 10px 12px;
			gap: 8px;
		}
		.rank-cell {
			min-width: 36px;
		}
		.rank-number {
			font-size: 14px;
		}
		.user-avatar {
			width: 32px;
			height: 32px;
			min-width: 32px;
			font-size: 14px;
		}
		.user-name {
			font-size: 13px;
		}
		.stats-cell {
			gap: 10px;
		}
		.stat-value {
			font-size: 13px;
		}
	}
</style>

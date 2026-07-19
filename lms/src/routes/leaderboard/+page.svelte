<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { user } from '$lib/stores/user.svelte';
	import { getDeviceId } from '$lib/utils/api';
	import ShareButton from '$lib/components/ShareButton.svelte';

	let loading = $state(true);
	let entries = $state<Array<{ user_id: string; xp: number; level: number; badge_count: number }>>([]);
	let currentUserId = $state('');
	let activeTab = $state<'global' | 'path'>('global');
	let pathSlug = $state('');

	let paths = $state<Array<{ slug: string; title: string }>>([]);

	let podiumEntries = $derived(entries.slice(0, 3));
	let listEntries = $derived(entries.slice(3));
	let maxXp = $derived(entries[0]?.xp || 1);

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

	const PODIUM_MEDALS = ['🥇', '🥈', '🥉'];
	const PODIUM_CLASSES = ['gold', 'silver', 'bronze'];
	const PODIUM_HEIGHTS = [180, 140, 120];

	function formatUserId(id: string): string {
		if (id === currentUserId) return t('leaderboard.you');
		return id.slice(0, 12) + '...';
	}

	function xpPercent(xp: number): number {
		return Math.round((xp / maxXp) * 100);
	}

	function rankIcon(rank: number): string {
		if (rank <= 3) return PODIUM_MEDALS[rank - 1];
		return `#${rank}`;
	}
</script>

<svelte:head>
	<title>{t('leaderboard.page_title')} — RPL AI Curriculum</title>
</svelte:head>

<div class="leaderboard-page">
	<h1 class="page-title">{t('leaderboard.page_title')}</h1>
	<p class="page-subtitle">{t('leaderboard.subtitle')}</p>

	<div class="share-row">
		<ShareButton
			title="Leaderboard RPL AI"
			text={t('leaderboard.share_text')}
			url={typeof window !== 'undefined' ? window.location.href : ''}
		/>
	</div>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'global'}
			onclick={() => { activeTab = 'global'; }}
		>{t('leaderboard.global_tab')}</button>
		<button
			class="tab"
			class:active={activeTab === 'path'}
			onclick={() => { activeTab = 'path'; }}
		>{t('leaderboard.path_tab')}</button>
	</div>

	{#if activeTab === 'path'}
		<div class="path-selector">
			<select bind:value={pathSlug} onchange={() => { if (pathSlug) activeTab = 'path'; }}>
				<option value="">{t('leaderboard.select_path')}</option>
				{#each paths as p}
					<option value={p.slug}>{p.title}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="leaderboard-content">
		{#if loading}
			<div class="loading-state">
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
				<p>{t('leaderboard.empty')}</p>
				<p class="empty-hint">{t('leaderboard.empty_hint')}</p>
			</div>
		{:else}
			{#if entries.length >= 1}
				<div class="podium">
					{#each podiumEntries as entry, i (entry.user_id)}
						{@const pc = PODIUM_CLASSES[i]}
						{@const medal = PODIUM_MEDALS[i]}
						<div
							class="podium-card {pc}"
							style="--p-delay: {i * 0.12}s; --p-height: {PODIUM_HEIGHTS[i]}px"
							class:is-current={entry.user_id === currentUserId}
						>
							<div class="podium-medal">{medal}</div>
							<div class="podium-avatar">
								{formatUserId(entry.user_id).charAt(0).toUpperCase()}
							</div>
							<div class="podium-name">{formatUserId(entry.user_id)}</div>
							<div class="podium-xp">{entry.xp.toLocaleString()} XP</div>
						</div>
					{/each}
				</div>
			{/if}

			{#if listEntries.length > 0}
				<div class="leaderboard-list">
					{#each listEntries as entry, i}
						{@const rank = i + 4}
						{@const pct = xpPercent(entry.xp)}
						<div
							class="leaderboard-row"
							class:is-current={entry.user_id === currentUserId}
						>
							<div class="rank-cell">
								<span class="rank-number">{#if rank <= 3}{PODIUM_MEDALS[rank - 1]}{:else}#{rank}{/if}</span>
							</div>
							<div class="user-cell">
								<div class="user-avatar">
									{formatUserId(entry.user_id).charAt(0).toUpperCase()}
								</div>
								<div class="user-info">
									<span class="user-name">
										{formatUserId(entry.user_id)}
										{#if entry.user_id === currentUserId}
											<span class="you-badge">{t('leaderboard.you_badge')}</span>
										{/if}
									</span>
									<div class="xp-bar-row">
										<div class="xp-bar">
											<div class="xp-bar-fill" style="width: {pct}%"></div>
										</div>
										<span class="xp-bar-label">{entry.xp.toLocaleString()} XP</span>
									</div>
								</div>
							</div>
							<div class="stats-cell">
								<span class="stat-level">
									<span class="stat-value">{entry.level}</span>
									<span class="stat-label">{t('leaderboard.stat_level') || 'Lvl'}</span>
								</span>
								<span class="stat-badges">
									<span class="stat-value">{entry.badge_count}</span>
									<span class="stat-label">{t('leaderboard.stat_badges')}</span>
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
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

	/* ===== LOADING / EMPTY ===== */

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

	.share-row {
		margin-bottom: 16px;
		display: flex;
		justify-content: flex-end;
	}

	/* ===== PODIUM ===== */

	.podium {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 16px;
		margin-bottom: 32px;
		padding: 24px 0 0;
	}

	.podium-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 20px 20px 16px;
		border-radius: 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		width: 150px;
		min-height: var(--p-height);
		opacity: 0;
		transform: translateY(30px);
		animation: podiumIn 0.5s ease-out forwards;
		animation-delay: var(--p-delay);
	}

	/* Gold — center, tallest */
	.podium-card.gold {
		border-color: #f59e0b;
		box-shadow: 0 0 24px rgba(245, 158, 11, 0.18);
		background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--surface) 100%);
	}
	.podium-card.gold .podium-avatar {
		background: linear-gradient(135deg, #f59e0b, #fbbf24);
		box-shadow: 0 0 18px rgba(245, 158, 11, 0.45);
		width: 56px;
		height: 56px;
		font-size: 22px;
	}
	.podium-card.gold .podium-xp {
		color: #f59e0b;
		text-shadow: 0 0 14px rgba(245, 158, 11, 0.5);
		font-weight: 800;
	}

	/* Silver — left, medium */
	.podium-card.silver {
		border-color: #94a3b8;
		box-shadow: 0 0 18px rgba(148, 163, 184, 0.13);
		background: linear-gradient(180deg, rgba(148, 163, 184, 0.06) 0%, var(--surface) 100%);
	}
	.podium-card.silver .podium-avatar {
		background: linear-gradient(135deg, #94a3b8, #cbd5e1);
		box-shadow: 0 0 14px rgba(148, 163, 184, 0.35);
	}
	.podium-card.silver .podium-xp {
		color: #94a3b8;
		text-shadow: 0 0 10px rgba(148, 163, 184, 0.4);
	}

	/* Bronze — right, shortest */
	.podium-card.bronze {
		border-color: #cd7f32;
		box-shadow: 0 0 16px rgba(205, 127, 50, 0.13);
		background: linear-gradient(180deg, rgba(205, 127, 50, 0.06) 0%, var(--surface) 100%);
	}
	.podium-card.bronze .podium-avatar {
		background: linear-gradient(135deg, #cd7f32, #d99f5b);
		box-shadow: 0 0 12px rgba(205, 127, 50, 0.3);
	}
	.podium-card.bronze .podium-xp {
		color: #cd7f32;
		text-shadow: 0 0 10px rgba(205, 127, 50, 0.4);
	}

	.podium-card.is-current {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}

	.podium-medal {
		font-size: 28px;
		line-height: 1;
	}

	.podium-avatar {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.podium-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 130px;
	}

	.podium-xp {
		font-size: 13px;
		font-weight: 700;
	}

	@keyframes podiumIn {
		from { opacity: 0; transform: translateY(30px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ===== LEADERBOARD LIST (4+) ===== */

	.leaderboard-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.leaderboard-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		transition: all 0.15s ease;
	}

	.leaderboard-row:hover {
		border-color: var(--accent-dim);
		background: color-mix(in srgb, var(--surface) 98%, var(--accent));
	}

	.leaderboard-row.is-current {
		background: var(--accent-dim);
		border-color: var(--accent);
	}

	.rank-cell {
		min-width: 40px;
		text-align: center;
	}

	.rank-number {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.user-cell {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		min-width: 36px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.user-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
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

	/* XP Bar */
	.xp-bar-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.xp-bar {
		flex: 1;
		max-width: 140px;
		height: 5px;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
	}

	.xp-bar-fill {
		height: 100%;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		transition: width 0.6s ease;
	}

	.xp-bar-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.stats-cell {
		display: flex;
		gap: 14px;
		align-items: center;
		flex-shrink: 0;
	}

	.stat-level,
	.stat-badges {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.stat-value {
		font-size: 14px;
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
		0%   { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* ===== RESPONSIVE ===== */

	@media (max-width: 768px) {
		.leaderboard-page {
			padding: 16px 0;
		}
		.page-title { font-size: 22px; }

		.tabs { gap: 6px; }
		.tab { padding: 6px 14px; font-size: 13px; }

		.podium {
			gap: 10px;
			margin-bottom: 24px;
		}
		.podium-card {
			width: 110px;
			padding: 16px 12px 12px;
			min-height: calc(var(--p-height) * 0.85);
		}
		.podium-medal { font-size: 22px; }
		.podium-avatar {
			width: 42px;
			height: 42px;
			font-size: 16px;
		}
		.podium-card.gold .podium-avatar {
			width: 48px;
			height: 48px;
			font-size: 18px;
		}
		.podium-name { font-size: 11px; max-width: 90px; }
		.podium-xp { font-size: 11px; }

		.leaderboard-row {
			padding: 10px 12px;
			gap: 8px;
		}
		.rank-cell { min-width: 32px; }
		.rank-number { font-size: 13px; }
		.user-avatar {
			width: 30px;
			height: 30px;
			min-width: 30px;
			font-size: 12px;
		}
		.user-name { font-size: 13px; }
		.xp-bar { max-width: 100px; }
		.stats-cell { gap: 10px; }
		.stat-value { font-size: 13px; }
	}
</style>

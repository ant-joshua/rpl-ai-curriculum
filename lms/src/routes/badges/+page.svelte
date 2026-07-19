<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { gamification, type Badge } from '$lib/stores/gamification.svelte';
	import { onMount } from 'svelte';

	let level = $derived(gamification.getLevelProgress());
	let badges = $derived(gamification.badges);
	let unlocked = $derived(gamification.unlockedBadges);
	let totalUnlocked = $derived(unlocked.length);
	let totalBadges = $derived(badges.length);

	let stats = $derived(gamification.computeStats());

	let grouped = $derived.by(() => {
		const groups: { label: string; key: string; items: Badge[] }[] = [
			{ label: 'Learning', key: 'learning', items: [] },
			{ label: 'Streak', key: 'streak', items: [] },
			{ label: 'Quiz', key: 'quiz', items: [] },
		];
		for (const b of badges) {
			const g = groups.find((g) => g.key === b.category);
			if (g) g.items.push(b);
		}
		return groups.filter((g) => g.items.length > 0);
	});

	function isUnlocked(badgeId: string): boolean {
		return unlocked.some((b) => b.id === badgeId);
	}

	function getUnlockDate(badgeId: string): string | undefined {
		const found = unlocked.find((b) => b.id === badgeId);
		return found?.unlockedAt;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	function getProgress(badge: Badge): { current: number; max: number } | null {
		if (isUnlocked(badge.id)) return null;
		if (badge.getProgress) return badge.getProgress(stats);
		return null;
	}

	let cardsVisible = $state(false);

	onMount(() => {
		gamification.checkBadges();
		requestAnimationFrame(() => {
			cardsVisible = true;
		});
	});
</script>

<svelte:head>
	<title>{t('badges.page_title')} — RPL AI Curriculum</title>
</svelte:head>

<div class="badges-page">
	<h1>{t('badges.page_title')}</h1>

	<!-- XP Counter Header -->
	<div class="xp-header">
		<div class="xp-header-left">
			<div class="level-badge">Level {level.level}</div>
			<div class="badge-progress">
				<span class="badge-progress-count">{totalUnlocked}</span>
				<span class="badge-progress-sep">/</span>
				<span class="badge-progress-total">{totalBadges}</span>
				<span class="badge-progress-label">earned</span>
			</div>
		</div>
		<div class="xp-header-right">
			<div class="xp-bar-container">
				<div
					class="xp-bar"
					style="width: {level.level > 1
						? (level.currentXp / (level.currentXp + level.xpToNext)) * 100
						: (level.currentXp / 100) * 100}%"
				></div>
			</div>
			<div class="xp-text">{level.currentXp}/{level.currentXp + level.xpToNext} XP</div>
		</div>
	</div>

	<!-- Badge Groups -->
	{#each grouped as group, groupIndex}
		<section class="badge-section">
			<h2 class="section-title">{group.label} Badges</h2>
			<div class="badges-grid">
				{#each group.items as badge, index}
					{@const earned = isUnlocked(badge.id)}
					{@const prog = getProgress(badge)}
					{@const pct = prog ? Math.round((prog.current / prog.max) * 100) : 100}
					{@const globalIndex = badges.indexOf(badge)}
					<div
						class="badge-card"
						class:earned
						class:locked={!earned}
						class:visible={cardsVisible}
						style="--card-index: {globalIndex}"
					>
						<!-- Lock overlay for locked badges -->
						{#if !earned}
							<div class="lock-overlay">
								<span class="lock-icon">🔒</span>
							</div>
						{/if}

						<!-- Earned badge on earned -->
						{#if earned}
							<div class="earned-tag">Earned</div>
						{/if}

						<!-- Icon -->
						<div class="badge-icon">{badge.icon}</div>

						<!-- Name -->
						<div class="badge-name">{badge.name}</div>

						<!-- Description -->
						<div class="badge-desc">{badge.description}</div>

						<!-- Progress bar (locked only) -->
						{#if !earned && prog}
							<div class="progress-container">
								<div class="progress-bar" style="width: {pct}%"></div>
							</div>
							<div class="progress-text">{prog.current}/{prog.max}</div>
						{/if}

						<!-- Earned date -->
						{#if earned}
							<div class="badge-date">
								Earned {formatDate(getUnlockDate(badge.id)!)}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	.badges-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 20px 0;
	}

	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 24px;
		color: var(--text);
	}

	/* ── XP Counter Header ── */
	.xp-header {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 20px 24px;
		margin-bottom: 32px;
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.xp-header-left {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-shrink: 0;
	}

	.level-badge {
		background: var(--accent-dim);
		color: var(--accent);
		font-size: 14px;
		font-weight: 700;
		padding: 6px 14px;
		border-radius: var(--radius-full);
		white-space: nowrap;
	}

	.badge-progress {
		display: flex;
		align-items: baseline;
		gap: 4px;
		white-space: nowrap;
	}

	.badge-progress-count {
		font-size: 28px;
		font-weight: 700;
		color: var(--accent);
		line-height: 1;
	}

	.badge-progress-sep {
		font-size: 20px;
		color: var(--text-tertiary);
	}

	.badge-progress-total {
		font-size: 20px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.badge-progress-label {
		font-size: 13px;
		color: var(--text-tertiary);
		margin-left: 4px;
	}

	.xp-header-right {
		flex: 1;
		min-width: 120px;
	}

	.xp-bar-container {
		height: 10px;
		background: var(--bg-secondary);
		border-radius: 5px;
		overflow: hidden;
		margin-bottom: 6px;
	}

	.xp-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 5px;
		transition: width 0.3s ease;
	}

	.xp-text {
		font-size: 12px;
		color: var(--text-tertiary);
		text-align: right;
	}

	/* ── Badge Sections ── */
	.badge-section {
		margin-bottom: 32px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-secondary);
		margin-bottom: 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--border);
	}

	/* ── Badges Grid ── */
	.badges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
	}

	/* ── Badge Card ── */
	.badge-card {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px 16px 16px;
		text-align: center;
		transition: all 0.25s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;

		/* Stagger animation */
		opacity: 0;
		transform: translateY(12px);
		transition: opacity 0.35s ease, transform 0.35s ease, box-shadow 0.2s ease, border-color 0.2s ease;
		transition-delay: calc(var(--card-index, 0) * 0.06s);
	}

	.badge-card.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.badge-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	/* Locked state */
	.badge-card.locked {
		opacity: 0.55;
		filter: grayscale(0.6);
	}

	.badge-card.locked:hover {
		opacity: 0.7;
		filter: grayscale(0.3);
	}

	/* Earned state — gold shimmer */
	.badge-card.earned {
		border-color: rgba(234, 179, 8, 0.25);
		background: linear-gradient(
			135deg,
			var(--surface) 0%,
			rgba(234, 179, 8, 0.04) 50%,
			var(--surface) 100%
		);
		position: relative;
		overflow: hidden;
	}

	.badge-card.earned::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 30%,
			rgba(234, 179, 8, 0.06) 45%,
			rgba(255, 215, 0, 0.1) 50%,
			rgba(234, 179, 8, 0.06) 55%,
			transparent 70%
		);
		background-size: 300% 100%;
		animation: shimmer 3s ease-in-out infinite;
		pointer-events: none;
		border-radius: inherit;
	}

	@keyframes shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* Lock overlay */
	.lock-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 12px;
		z-index: 1;
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}

	.badge-card.locked:hover .lock-overlay {
		opacity: 1;
	}

	.lock-icon {
		font-size: 32px;
	}

	/* Earned tag */
	.earned-tag {
		position: absolute;
		top: 8px;
		right: 8px;
		background: linear-gradient(135deg, #eab308, #fbbf24);
		color: #000;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 2px 8px;
		border-radius: var(--radius-full);
		z-index: 2;
	}

	/* Badge card contents */
	.badge-icon {
		font-size: 40px;
		margin-bottom: 4px;
		line-height: 1;
	}

	.badge-name {
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.badge-desc {
		font-size: 11px;
		color: var(--text-tertiary);
		line-height: 1.4;
	}

	/* Progress bar */
	.progress-container {
		width: 100%;
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		overflow: hidden;
		margin-top: 6px;
	}

	.progress-bar {
		height: 100%;
		background: var(--accent);
		border-radius: 3px;
		transition: width 0.4s ease;
	}

	.progress-text {
		font-size: 11px;
		color: var(--text-quaternary);
	}

	/* Earned date */
	.badge-date {
		font-size: 10px;
		color: var(--accent);
		font-weight: 500;
		margin-top: 2px;
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.badges-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.badge-icon {
			font-size: 32px;
		}
		.xp-header {
			flex-direction: column;
			align-items: stretch;
			gap: 12px;
		}
		.xp-header-left {
			justify-content: center;
		}
	}
</style>

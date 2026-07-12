<script lang="ts">
	import { gamification } from '$lib/stores/gamification.svelte';
	import { onMount } from 'svelte';

	let level = $derived(gamification.getLevelProgress());
	let badges = $derived(gamification.badges);
	let unlocked = $derived(gamification.unlockedBadges);
	let totalUnlocked = $derived(unlocked.length);
	let totalBadges = $derived(badges.length);

	function getUnlockDate(badgeId: string): string | undefined {
		const found = unlocked.find((b) => b.id === badgeId);
		return found?.unlockedAt;
	}

	function isUnlocked(badgeId: string): boolean {
		return unlocked.some((b) => b.id === badgeId);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	onMount(() => {
		gamification.checkBadges();
	});
</script>

<svelte:head>
	<title>🏆 Badges — RPL AI Curriculum</title>
</svelte:head>

<div class="badges-page">
	<h1>🏆 Badges</h1>

	<!-- Level Card -->
	<div class="level-card">
		<div class="level-info">
			<span class="level-number">Level {level.level}</span>
			<span class="badge-count">{totalUnlocked}/{totalBadges} badges unlocked</span>
		</div>
		<div class="xp-bar-container">
			<div class="xp-bar" style="width: {level.level > 1 ? (level.currentXp / (level.currentXp + level.xpToNext)) * 100 : (level.currentXp / 100) * 100}%"></div>
		</div>
		<div class="xp-text">{level.currentXp}/{level.currentXp + level.xpToNext} XP</div>
	</div>

	<!-- Badges Grid -->
	<div class="badges-grid">
		{#each badges as badge}
			<div class="badge-card" class:unlocked={isUnlocked(badge.id)} class:locked={!isUnlocked(badge.id)}>
				<div class="badge-icon">{isUnlocked(badge.id) ? badge.icon : '🔒'}</div>
				<div class="badge-name">{isUnlocked(badge.id) ? badge.name : '???'}</div>
				<div class="badge-desc">
					{isUnlocked(badge.id) ? badge.description : 'Selesaikan tantangan untuk membuka'}
				</div>
				{#if isUnlocked(badge.id)}
					<div class="badge-date">
						Diraih: {formatDate(getUnlockDate(badge.id)!)}
					</div>
				{/if}
			</div>
		{/each}
	</div>
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

	.level-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		padding: 24px;
		margin-bottom: 32px;
	}

	.level-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.level-number {
		font-size: 20px;
		font-weight: 700;
		color: var(--accent);
	}

	.badge-count {
		font-size: 14px;
		color: var(--text-secondary);
	}

	.xp-bar-container {
		height: 12px;
		background: var(--bg-secondary);
		border-radius: 6px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.xp-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 6px;
		transition: width 0.3s ease;
	}

	.xp-text {
		font-size: 13px;
		color: var(--text-secondary);
		text-align: right;
	}

	.badges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 16px;
	}

	.badge-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		transition: all 0.2s ease;
	}

	.badge-card.unlocked {
		opacity: 1;
	}

	.badge-card.locked {
		opacity: 0.5;
		filter: grayscale(1);
	}

	.badge-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.badge-icon {
		font-size: 40px;
		margin-bottom: 12px;
	}

	.badge-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		margin-bottom: 6px;
	}

	.badge-desc {
		font-size: 12px;
		color: var(--text-secondary);
		line-height: 1.4;
		margin-bottom: 8px;
	}

	.badge-date {
		font-size: 11px;
		color: var(--accent);
		font-weight: 500;
	}
</style>

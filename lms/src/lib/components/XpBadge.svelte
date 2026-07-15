<script lang="ts">
	import { browser } from '$app/environment';

	let { compact = false }: { compact?: boolean } = $props();

	let xp = $state(0);
	let level = $state(1);
	let currentLevelXp = $state(0);
	let xpToNext = $state(100);
	let loading = $state(true);

	$effect(() => {
		if (!browser) return;
		fetchStats();
	});

	async function fetchStats() {
		try {
			const res = await fetch('/api/gamification/my-stats', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					xp = json.data.totalXp;
					level = json.data.level;
					currentLevelXp = json.data.currentLevelXp;
					xpToNext = json.data.xpToNext;
				}
			}
		} catch {
			// offline
		} finally {
			loading = false;
		}
	}

	let pct = $derived(xpToNext > 0 ? Math.round((currentLevelXp / (currentLevelXp + xpToNext)) * 100) : 0);
	let progressColor = $derived(
		level >= 20 ? 'var(--accent)' :
		level >= 10 ? '#f59e0b' :
		level >= 5 ? '#8b5cf6' :
		'var(--accent)'
	);
</script>

{#if loading}
	<div class="xp-badge-skeleton">...</div>
{:else}
	<div class="xp-badge" class:compact>
		<div class="xp-level-icon">
			{#if level >= 20}
				💎
			{:else if level >= 10}
				🏅
			{:else if level >= 5}
				⭐
			{:else}
				📌
			{/if}
		</div>
		<div class="xp-info">
			<span class="xp-level">Lv.{level}</span>
			<span class="xp-amount" class:compact>{xp.toLocaleString()} XP</span>
			<div class="xp-progress-bar" class:compact>
				<div class="xp-progress-fill" style="width: {pct}%; background: {progressColor};"></div>
			</div>
		</div>
	</div>
{/if}

<style>
	.xp-badge-skeleton {
		font-size: 12px;
		color: var(--text-secondary);
		padding: 4px 0;
	}
	.xp-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		transition: all 0.15s;
	}
	.xp-badge:hover {
		border-color: var(--accent-dim);
	}
	.xp-badge.compact {
		padding: 4px 8px;
		border-radius: 6px;
		gap: 4px;
	}
	.xp-level-icon { font-size: 20px; }
	.xp-badge.compact .xp-level-icon { font-size: 16px; }
	.xp-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.xp-level {
		font-size: 13px;
		font-weight: 700;
		color: var(--accent);
	}
	.xp-amount {
		font-size: 11px;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.xp-amount.compact {
		font-size: 10px;
	}
	.xp-progress-bar {
		height: 4px;
		background: var(--bg-secondary);
		border-radius: 2px;
		overflow: hidden;
		width: 100%;
	}
	.xp-progress-bar.compact {
		height: 3px;
	}
	.xp-progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.3s ease;
	}
</style>

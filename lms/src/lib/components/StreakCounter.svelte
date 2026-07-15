<script lang="ts">
	import { browser } from '$app/environment';

	let { currentStreak = 0, longestStreak = 0, compact = false }: {
		currentStreak?: number;
		longestStreak?: number;
		compact?: boolean;
	} = $props();

	let streakData = $state<{ current: number; longest: number } | null>(null);
	let loading = $state(true);

	$effect(() => {
		if (!browser) return;
		loadStreak();
	});

	async function loadStreak() {
		loading = true;
		try {
			const res = await fetch('/api/gamification/my-stats', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			if (res.ok) {
				const json = await res.json();
				if (json.success && json.data) {
					streakData = {
						current: json.data.streak.current,
						longest: json.data.streak.longest,
					};
				}
			}
		} catch {
			// offline — use prop defaults
		} finally {
			loading = false;
		}
	}

	let display = $derived(streakData ?? { current: currentStreak, longest: longestStreak });
</script>

{#if compact}
	<div class="streak-compact">
		<span class="streak-fire">🔥</span>
		<span class="streak-count">{display.current}</span>
	</div>
{:else}
	<div class="streak-counter">
		<div class="streak-header">
			<span class="streak-fire-big">🔥</span>
			<span class="streak-label">Streak</span>
		</div>
		<div class="streak-numbers">
			<span class="streak-current">{display.current}</span>
			<span class="streak-sep">/</span>
			<span class="streak-longest">{display.longest}</span>
		</div>
		<div class="streak-sub">
			<span class="streak-current-label">hari</span>
			<span class="streak-longest-label">terpanjang</span>
		</div>
	</div>
{/if}

{#if !loading && display.current >= 3}
	<div class="streak-milestone" class:compact>
		🔥 {display.current}-day streak!
	</div>
{/if}

<style>
	.streak-compact {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 13px;
		font-weight: 600;
	}
	.streak-fire { font-size: 16px; }
	.streak-count { color: var(--accent); }

	.streak-counter {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		text-align: center;
	}
	.streak-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.streak-fire-big { font-size: 20px; }
	.streak-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
	.streak-numbers {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 4px;
	}
	.streak-current { font-size: 28px; font-weight: 800; color: var(--accent); }
	.streak-sep { font-size: 18px; color: var(--text-secondary); }
	.streak-longest { font-size: 18px; font-weight: 600; color: var(--text-secondary); }
	.streak-sub {
		display: flex;
		justify-content: center;
		gap: 12px;
		font-size: 11px;
		color: var(--text-secondary);
	}
	.streak-longest-label { color: var(--text-secondary); }

	.streak-milestone {
		margin-top: 8px;
		padding: 6px 12px;
		background: linear-gradient(135deg, #f97316, #ef4444);
		color: white;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		text-align: center;
		animation: pulse 2s infinite;
	}
	.streak-milestone.compact {
		margin-top: 4px;
		padding: 4px 8px;
		font-size: 11px;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.85; }
	}
</style>

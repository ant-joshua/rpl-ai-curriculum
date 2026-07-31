<script lang="ts">
	import { browser } from '$app/environment';
	import { addToast } from '$lib/stores/toast.svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	interface Quest {
		quest_key: string;
		title: string;
		description: string;
		target: number;
		progress: number;
		xp_reward: number;
		claimed: number | boolean;
	}

	let { compact = false }: { compact?: boolean } = $props();

	let quests = $state<Quest[]>([]);
	let loading = $state(true);
	let claimingKey = $state<string | null>(null);

	const QUEST_ICONS: Record<string, string> = {
		complete_lessons: '🎯',
		earn_xp: '⚡',
		practice: '📝',
		streak: '🔥',
	};

	const todayLabel = new Date().toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	});

	$effect(() => {
		if (!browser) return;
		loadQuests();
	});

	async function loadQuests() {
		loading = true;
		try {
			const res = await fetch('/api/gamification/quests', {
				headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
			});
			if (!res.ok) {
				addToast('Gagal memuat quest harian', 'error');
				return;
			}
			const json = await res.json();
			if (json.success && Array.isArray(json.data)) {
				quests = json.data;
			}
		} catch {
			addToast('Gagal memuat quest harian', 'error');
		} finally {
			loading = false;
		}
	}

	async function claimQuest(quest: Quest) {
		if (claimingKey) return;
		claimingKey = quest.quest_key;
		try {
			const res = await fetch('/api/gamification/quests/claim', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
				},
				body: JSON.stringify({ questKey: quest.quest_key })
			});
			if (!res.ok) {
				const json = await res.json().catch(() => null);
				addToast(json?.error || 'Gagal klaim quest', 'error');
				return;
			}
			const json = await res.json();
			const xp = json?.data?.xpAwarded ?? quest.xp_reward;
			addToast(`Quest selesai! +${xp} XP`, 'success');
			pushXpGain(xp);
			await loadQuests();
		} catch {
			addToast('Gagal klaim quest', 'error');
		} finally {
			claimingKey = null;
		}
	}

	function questIcon(key: string): string {
		return QUEST_ICONS[key] || '⭐';
	}

	function isComplete(q: Quest): boolean {
		return q.progress >= q.target;
	}

	function isClaimed(q: Quest): boolean {
		return Boolean(q.claimed);
	}
</script>

<div class="daily-quests" class:compact>
	<header class="quests-header">
		<h2 class="quests-title">🎯 Quest Harian</h2>
		<span class="quests-date">{todayLabel}</span>
	</header>

	{#if loading}
		<div class="quests-loading">
			<span class="spinner"></span>
			<span>Memuat quest…</span>
		</div>
	{:else if quests.length === 0}
		<p class="quests-empty">Belum ada quest hari ini.</p>
	{:else}
		<ul class="quest-list">
			{#each quests as quest (quest.quest_key)}
				{@const done = isComplete(quest)}
				{@const claimed = isClaimed(quest)}
				{@const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100))}
				<li class="quest-item" class:complete={done && !claimed} class:claimed class:compact>
					<div class="quest-row">
						<span class="quest-icon" class:claimed>{questIcon(quest.quest_key)}</span>
						<div class="quest-body">
							<span class="quest-title" class:claimed>{quest.title}</span>
							{#if !compact}
								<span class="quest-desc" class:claimed>{quest.description}</span>
							{/if}
							<div class="quest-progress-bar">
								<div class="quest-progress-fill" class:complete={done && !claimed} style="width: {pct}%"></div>
							</div>
							{#if !compact}
								<span class="quest-meta" class:claimed>{quest.progress}/{quest.target}</span>
							{/if}
						</div>
						{#if compact}
							{#if claimed}
								<span class="quest-check" title="Selesai">✓</span>
							{:else if done}
								<button
									class="claim-btn claim-btn-mini"
									class:disabled={claimingKey === quest.quest_key}
									onclick={() => claimQuest(quest)}
									disabled={claimingKey !== null}
								>
									+{quest.xp_reward}
								</button>
							{:else}
								<span class="quest-pct">{pct}%</span>
							{/if}
						{:else}
							{#if claimed}
								<span class="quest-check">✓</span>
							{:else if done}
								<button
									class="claim-btn"
									class:disabled={claimingKey === quest.quest_key}
									onclick={() => claimQuest(quest)}
									disabled={claimingKey !== null}
								>
									{claimingKey === quest.quest_key ? 'Klaim…' : `Klaim +${quest.xp_reward} XP`}
								</button>
							{/if}
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.daily-quests {
		background: var(--surface, #ffffff);
		border: 1px solid var(--border, #e2e8f0);
		border-radius: var(--radius, 12px);
		box-shadow: var(--shadow, 0 1px 3px rgba(0, 0, 0, 0.08));
		padding: 20px;
	}

	.daily-quests.compact {
		padding: 14px;
	}

	.quests-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 14px;
	}

	.compact .quests-header {
		margin-bottom: 10px;
	}

	.quests-title {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
		color: var(--text, #1a1a2e);
	}

	.quests-date {
		font-size: 12px;
		color: var(--text-secondary, #64748b);
		text-align: right;
	}

	.quest-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.quest-item {
		border: 1px solid var(--border, #e2e8f0);
		border-radius: 10px;
		background: var(--surface-alt, #f8fafc);
		padding: 12px;
		transition: border-color 0.2s ease, background 0.2s ease;
	}

	.quest-item.complete {
		border-color: rgba(34, 197, 94, 0.4);
		background: var(--success-light, rgba(34, 197, 94, 0.08));
	}

	.quest-item.claimed {
		opacity: 0.65;
	}

	.quest-item.compact {
		padding: 8px 10px;
	}

	.quest-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.quest-icon {
		font-size: 22px;
		line-height: 1;
		flex-shrink: 0;
	}

	.quest-icon.claimed {
		filter: grayscale(1);
	}

	.quest-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.quest-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--text, #1a1a2e);
	}

	.quest-title.claimed {
		text-decoration: line-through;
		color: var(--text-secondary, #64748b);
	}

	.quest-desc {
		font-size: 12px;
		color: var(--text-secondary, #64748b);
	}

	.quest-desc.claimed {
		text-decoration: line-through;
	}

	.quest-progress-bar {
		height: 8px;
		border-radius: 999px;
		background: var(--border, #e2e8f0);
		overflow: hidden;
	}

	.quest-progress-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--accent, #4f46e5);
		transition: width 0.5s ease, background 0.3s ease;
	}

	.quest-progress-fill.complete {
		background: var(--success, #22c55e);
	}

	.quest-meta {
		font-size: 11px;
		color: var(--text-secondary, #64748b);
		font-variant-numeric: tabular-nums;
	}

	.quest-meta.claimed {
		text-decoration: line-through;
	}

	/* Claim button — green 3D solid shadow */
	.claim-btn {
		flex-shrink: 0;
		background: var(--success, #22c55e);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm, 8px);
		padding: 8px 14px;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		box-shadow: var(--shadow-3d-success, 0 4px 0 #15803d);
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.claim-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 5px 0 #15803d;
	}

	.claim-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 #15803d;
	}

	.claim-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.claim-btn-mini {
		padding: 6px 10px;
		font-size: 12px;
	}

	.quest-check {
		flex-shrink: 0;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--success, #22c55e);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 800;
	}

	.quest-pct {
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary, #64748b);
		font-variant-numeric: tabular-nums;
	}

	.quests-loading {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 0;
		color: var(--text-secondary, #64748b);
		font-size: 13px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--border, #e2e8f0);
		border-top-color: var(--accent, #4f46e5);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.quests-empty {
		margin: 0;
		padding: 16px 0;
		color: var(--text-secondary, #64748b);
		font-size: 13px;
		text-align: center;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>

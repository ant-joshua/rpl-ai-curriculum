<script lang="ts">
	import { getQuestCompleteEvent, dismissQuestComplete } from '$lib/stores/quest-complete.svelte';
	import type { QuestCompleteEvent } from '$lib/stores/quest-complete.svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	// Reactive view of store state
	let ev = $state<QuestCompleteEvent | null>(null);
	$effect(() => {
		ev = getQuestCompleteEvent();
		if (ev) {
			const timer = setTimeout(() => {
				dismissQuestComplete();
			}, 6000);
			return () => clearTimeout(timer);
		}
	});

	function handleClaim() {
		if (!ev) return;
		// Push XP toast for the reward (claim happens via DailyQuests UI or auto)
		pushXpGain(ev.xpReward);
		dismissQuestComplete();
	}
</script>

{#if ev}
	<div class="quest-popup-overlay" onclick={dismissQuestComplete}>
		<div class="quest-popup" onclick={(e) => e.stopPropagation()}>
			<div class="quest-popup-confetti">🎉</div>
			<h3 class="quest-popup-title">Quest Selesai!</h3>
			<p class="quest-popup-desc">{ev.description || ev.title}</p>
			<div class="quest-popup-reward">
				<span class="quest-popup-xp">+{ev.xpReward} XP</span>
			</div>
			<button class="quest-popup-btn" onclick={handleClaim}>Klaim Hadiah</button>
		</div>
	</div>
{/if}

<style>
	.quest-popup-overlay {
		position: fixed; inset: 0; z-index: 9999;
		background: rgba(0, 0, 0, 0.45);
		display: flex; align-items: center; justify-content: center;
	}
	.quest-popup {
		background: white; border-radius: 20px;
		padding: 32px 40px; max-width: 360px; width: 90%;
		text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
		animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pop-in {
		from { transform: scale(0.7); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
	.quest-popup-confetti { font-size: 48px; margin-bottom: 8px; }
	.quest-popup-title { font-size: 22px; font-weight: 800; color: #1f2937; margin: 0 0 6px; }
	.quest-popup-desc { font-size: 14px; color: #6b7280; margin: 0 0 16px; }
	.quest-popup-reward { margin-bottom: 16px; }
	.quest-popup-xp {
		display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316);
		color: white; font-weight: 800; font-size: 16px;
		padding: 6px 16px; border-radius: 999px;
	}
	.quest-popup-btn {
		background: #22c55e; color: white; border: none;
		padding: 10px 28px; border-radius: 10px;
		font-size: 15px; font-weight: 700; cursor: pointer;
		transition: transform 0.15s, background 0.15s;
	}
	.quest-popup-btn:hover { background: #16a34a; transform: translateY(-2px); }
</style>

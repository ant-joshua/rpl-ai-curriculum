<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	let { block, onComplete }: { block: any; onComplete?: (score: number, total: number, xp: number) => void } = $props();
	const dispatch = createEventDispatcher();

	let meta: Record<string, any> = $derived(
		typeof block.meta === 'string' ? JSON.parse(block.meta || '{}') : (block.meta || {})
	);

	let originalPairs: { left: string; right: string }[] = $derived(meta?.pairs || []);

	interface ShuffledItem {
		id: string;
		content: string;
		type: 'left' | 'right';
		matched: boolean;
		correct: boolean;
	}

	let totalPairs = $derived(originalPairs.length);

	let leftItems = $state<ShuffledItem[]>([]);
	let rightItems = $state<ShuffledItem[]>([]);
	let selectedLeftId = $state<string | null>(null);
	let matchedCount = $state(0);
	let completed = $state(false);
	let xpEarned = $state(0);

	function init() {
		const shuffledRight = [...originalPairs].sort(() => Math.random() - 0.5);
		leftItems = originalPairs.map((p, i) => ({
			id: `left-${i}`,
			content: p.left,
			type: 'left',
			matched: false,
			correct: false,
		}));
		rightItems = shuffledRight.map((p, i) => ({
			id: `right-${i}`,
			content: p.right,
			type: 'right',
			matched: false,
			correct: false,
		}));
		selectedLeftId = null;
		matchedCount = 0;
		completed = false;
		xpEarned = 0;
	}

	function selectLeft(id: string) {
		if (leftItems.find((i) => i.id === id)?.matched) return;
		selectedLeftId = id;
	}

	async function queueWrong(prompt: string, answer: string) {
		try {
			await fetch('/api/practice/queue', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ blockId: block.id, questionRef: `match-${prompt}`, prompt, correctAnswer: answer })
			});
		} catch { /* offline */ }
	}

	function selectRight(id: string) {
		if (!selectedLeftId) return;
		const right = rightItems.find((i) => i.id === id);
		if (!right || right.matched) return;

		const left = leftItems.find((i) => i.id === selectedLeftId);
		if (!left) return;

		const leftIdx = parseInt(left.id.split('-')[1]);
		const originalRight = originalPairs[leftIdx];

		if (originalRight.right === right.content) {
			leftItems = leftItems.map((i) => i.id === left.id ? { ...i, matched: true, correct: true } : i);
			rightItems = rightItems.map((i) => i.id === right.id ? { ...i, matched: true, correct: true } : i);
			matchedCount++;
			selectedLeftId = null;

			if (matchedCount === totalPairs) {
				const earned = totalPairs * 3;
				xpEarned = earned;
				pushXpGain(earned);
				setTimeout(() => {
					completed = true;
					finish();
				}, 800);
			}
		} else {
			queueWrong(left.content, originalRight.right);
			leftItems = leftItems.map((i) => i.id === left.id ? { ...i, correct: false } : i);
			rightItems = rightItems.map((i) => i.id === right.id ? { ...i, correct: false } : i);
			setTimeout(() => {
				leftItems = leftItems.map((i) => i.id === left.id ? { ...i, correct: true } : i);
				rightItems = rightItems.map((i) => i.id === right.id ? { ...i, correct: true } : i);
			}, 600);
			selectedLeftId = null;
		}
	}

	function finish() {
		dispatch('complete', { correct: totalPairs, total: totalPairs });
		onComplete?.(totalPairs, totalPairs, xpEarned);
	}

	init();
</script>

<div class="matching-wrapper">
	<h3 class="matching-title">{block.title || 'Pasangkan Konsep'}</h3>

	{#if block.body_html}
		<div class="matching-intro markdown-content">{@html block.body_html}</div>
	{/if}

	{#if completed}
		<div class="completion-card">
			<div class="completion-icon">🎉</div>
			<h4 class="completion-title">Semua Pasangan Cocok!</h4>
			<p class="completion-text">
				Kamu mencocokkan <strong>{matchedCount}</strong> dari {totalPairs} pasangan dengan benar.
			</p>
			<p class="xp-earned">+{xpEarned} XP</p>
			<button class="continue-btn" onclick={finish}>Lanjut</button>
		</div>
	{:else if totalPairs === 0}
		<p class="empty-note">Belum ada pasangan untuk blok ini.</p>
	{:else}
		<div class="progress-row">
			<div class="progress-track">
				<div class="progress-fill" style="width: {(matchedCount / totalPairs) * 100}%"></div>
			</div>
			<span class="progress-text">{matchedCount} / {totalPairs}</span>
		</div>

		<div class="board">
			<div class="col">
				{#each leftItems as item (item.id)}
					<button
						class="item-card left"
						class:matched={item.matched}
						class:selected={selectedLeftId === item.id}
						class:incorrect-flash={!item.correct && !item.matched}
						onclick={() => selectLeft(item.id)}
						disabled={item.matched}
					>
						{item.content}
					</button>
				{/each}
			</div>
			<div class="col">
				{#each rightItems as item (item.id)}
					<button
						class="item-card right"
						class:matched={item.matched}
						class:incorrect-flash={!item.correct && !item.matched}
						onclick={() => selectRight(item.id)}
						disabled={item.matched}
					>
						{item.content}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.matching-wrapper { padding: 16px; }
	.matching-title { font-size: 18px; font-weight: 600; color: var(--text); margin: 0 0 16px; }
	.matching-intro { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6; }

	.progress-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
	.progress-track { flex: 1; height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden; }
	.progress-fill { height: 100%; background: var(--success, #22C55E); border-radius: 3px; transition: width 0.4s ease; }
	.progress-text { font-size: 13px; font-weight: 600; color: #64748b; }

	.board { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
	.col { display: flex; flex-direction: column; gap: 12px; flex: 1; max-width: 320px; }

	.item-card {
		padding: 16px;
		background: white;
		border: 2px solid var(--border, #E2E8F0);
		border-radius: 12px;
		font-size: 15px;
		font-weight: 500;
		color: #334155;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 0 rgba(0,0,0,0.02);
		text-align: left;
	}
	.left { background: rgba(79,70,229,0.03); }
	.item-card:hover:not(:disabled) { border-color: #cbd5e1; transform: translateY(-1px); }
	.item-card:active:not(:disabled) { transform: translateY(1px); }

	.selected { border-color: var(--accent); background: rgba(79,70,229,0.08); box-shadow: 0 0 0 2px rgba(79,70,229,0.2); }

	.matched {
		opacity: 0.6;
		border-color: var(--success);
		background: rgba(34,197,94,0.05);
		cursor: default;
		transform: scale(0.98);
	}

	.incorrect-flash {
		border-color: var(--error, #EF4444) !important;
		background: rgba(239,68,68,0.05) !important;
		animation: shake 0.4s;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-4px); }
		40%, 80% { transform: translateX(4px); }
	}

	.completion-card {
		text-align: center;
		padding: 40px;
		background: white;
		border: 1px solid var(--border);
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
	}
	.completion-icon { font-size: 48px; margin-bottom: 16px; }
	.completion-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px; }
	.completion-text { color: #64748b; margin-bottom: 16px; }
	.xp-earned { font-size: 18px; font-weight: 700; color: var(--success); margin-bottom: 24px; }
	.continue-btn {
		padding: 12px 32px;
		background: var(--accent);
		color: white;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 0 rgba(79,70,229,0.2);
	}
	.continue-btn:active { transform: translateY(4px); box-shadow: none; }
	.empty-note { text-align: center; color: #94a3b8; padding: 32px; }
</style>
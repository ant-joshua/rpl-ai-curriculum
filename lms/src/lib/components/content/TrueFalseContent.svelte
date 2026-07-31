<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	let { block, onComplete }: { block: any; onComplete?: (score: number, total: number, xp: number) => void } = $props();
	const dispatch = createEventDispatcher();

	let meta: Record<string, any> = $derived(
		typeof block.meta === 'string' ? JSON.parse(block.meta || '{}') : (block.meta || {})
	);
	let statements: { text: string; answer: boolean; explanation?: string }[] = $derived(meta?.statements || []);

	let currentIndex = $state(0);
	let correctCount = $state(0);
	let answered = $state(false);
	let lastCorrect = $state(false);
	let completed = $state(false);
	let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

	let current = $derived(statements[currentIndex] || null);
	let total = $derived(statements.length);
	let score = $derived(`${correctCount}/${total}`);

	function choose(value: boolean) {
		if (answered || completed) return;
		answered = true;
		const isCorrect = current?.answer === value;
		lastCorrect = isCorrect;
		if (isCorrect) correctCount++;

		if (isCorrect) {
			autoAdvanceTimer = setTimeout(() => {
				goNext();
			}, 1200);
		}
	}

	function goNext() {
		if (currentIndex < total - 1) {
			currentIndex++;
			answered = false;
			lastCorrect = false;
		} else {
			completed = true;
			pushXpGain(correctCount * 5);
			complete();
		}
	}

	function complete() {
		dispatch('complete');
		onComplete?.(correctCount, total, correctCount * 5);
	}

	function reset() {
		if (autoAdvanceTimer) {
			clearTimeout(autoAdvanceTimer);
		}
		currentIndex = 0;
		correctCount = 0;
		answered = false;
		lastCorrect = false;
		completed = false;
	}
</script>

<div class="truefalse-wrapper">
	{#if completed}
		<div class="complete-state">
			<div class="trophy">🏆</div>
			<h3>Selesai!</h3>
			<div class="score-display">Skor: {score}</div>
			<div class="xp-earned">+{correctCount * 5} XP</div>
			<button class="btn-continue" onclick={() => reset()}>Coba Lagi</button>
			<button class="btn-continue primary" onclick={() => onComplete?.(correctCount, total, correctCount * 5)}>Selesai</button>
		</div>
	{:else if current}
		<div class="question-progress">
			{currentIndex + 1} / {total}
		</div>

		<div class="statement-card">
			<p class="statement-text">"{current.text}"</p>
			<div class="answers">
				<button
					class="answer-btn btn-true"
					class:revealed-correct={answered && current.answer === true}
					class:revealed-wrong={answered && !lastCorrect && current.answer === false}
					onclick={() => choose(true)}
					disabled={answered}
				>
					<span class="answer-icon">✅</span>
					<span class="answer-label">Benar</span>
				</button>
				<button
					class="answer-btn btn-false"
					class:revealed-correct={answered && current.answer === false}
					class:revealed-wrong={answered && !lastCorrect && current.answer === true}
					onclick={() => choose(false)}
					disabled={answered}
				>
					<span class="answer-icon">❌</span>
					<span class="answer-label">Salah</span>
				</button>
			</div>
		</div>

		{#if answered}
			<div class="feedback" class:correct={lastCorrect} class:wrong={!lastCorrect}>
				{#if lastCorrect}
					<span class="feedback-icon">🎉</span>
					<span class="feedback-text">Benar! +5 XP</span>
				{:else}
					<span class="feedback-icon">😅</span>
					<span class="feedback-text">Salah! Jawaban benar: {current.answer ? 'Benar' : 'Salah'}</span>
					{#if current.explanation}
						<p class="explanation">{current.explanation}</p>
					{/if}
				{/if}
			</div>
			{#if !lastCorrect}
				<button class="btn-continue" onclick={() => goNext()}>Lanjut</button>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.truefalse-wrapper {
		padding: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.question-progress {
		font-size: 13px;
		font-weight: 600;
		color: #94a3b8;
		margin-bottom: 16px;
	}
	.statement-card {
		background: var(--surface, #F8FAFC);
		border: 1px solid var(--border, #E2E8F0);
		border-radius: 12px;
		padding: 32px;
		text-align: center;
		width: 100%;
		margin-bottom: 24px;
		box-shadow: 0 2px 4px rgba(0,0,0,0.02);
	}
	.statement-text {
		font-size: 22px;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 32px;
		line-height: 1.4;
	}
	.answers {
		display: flex;
		gap: 16px;
		justify-content: center;
	}
	.answer-btn {
		flex: 1;
		max-width: 200px;
		padding: 24px 16px;
		background: white;
		border: 2px solid var(--border, #E2E8F0);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 0 rgba(0,0,0,0.05);
	}
	.answer-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		border-color: #cbd5e1;
		box-shadow: 0 6px 0 rgba(0,0,0,0.05);
	}
	.answer-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 1px 0 rgba(0,0,0,0.05);
	}
	.answer-icon {
		font-size: 32px;
	}
	.answer-label {
		font-size: 16px;
		font-weight: 600;
		color: #334155;
	}

	.btn-true.revealed-correct { border-color: var(--success, #22C55E); background: rgba(34,197,94,0.05); }
	.btn-false.revealed-correct { border-color: var(--success, #22C55E); background: rgba(34,197,94,0.05); }
	
	.btn-true.revealed-wrong, .btn-false.revealed-wrong {
		border-color: var(--error, #EF4444);
		background: rgba(239,68,68,0.05);
		animation: shake 0.4s ease-in-out;
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-5px); }
		40%, 80% { transform: translateX(5px); }
	}

	.feedback {
		padding: 16px;
		border-radius: 12px;
		text-align: center;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		margin-bottom: 16px;
	}
	.feedback.correct { background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.2); }
	.feedback.wrong { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.2); }
	.feedback-icon { font-size: 24px; }
	.feedback-text { font-size: 16px; font-weight: 600; color: #0f172a; }
	.explanation { font-size: 14px; color: #64748b; margin: 8px 0 0; font-style: italic; }

	.btn-continue {
		padding: 12px 32px;
		background: var(--accent, #4F46E5);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 0 rgba(79,70,229,0.2);
		transition: all 0.1s;
	}
	.btn-continue:active {
		transform: translateY(4px);
		box-shadow: none;
	}

	.complete-state {
		text-align: center;
		padding: 40px 20px;
		width: 100%;
		background: white;
		border-radius: 16px;
		border: 1px solid var(--border);
	}
	.trophy { font-size: 64px; margin-bottom: 16px; }
	.score-display { font-size: 32px; font-weight: 800; color: #0f172a; margin: 16px 0 8px; }
	.xp-earned { font-size: 20px; font-weight: 700; color: var(--success, #22C55E); margin-bottom: 32px; }
</style>
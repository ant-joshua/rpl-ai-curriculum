<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { pushXpGain } from '$lib/stores/xp-toast.svelte';

	let { contentBlock, onComplete }: { contentBlock: any; onComplete?: (score: number, total: number, xp: number) => void } = $props();
	const dispatch = createEventDispatcher();

	let meta: Record<string, any> = $derived(
		typeof contentBlock.meta === 'string'
			? JSON.parse(contentBlock.meta || '{}')
			: (contentBlock.meta || {})
	);
	let questions: any[] = $derived(meta?.questions || []);

	let currentIndex = $state(0);
	let correctCount = $state(0);
	let selectedOption = $state<number | null>(null);
	let isChecked = $state(false);
	let isCorrect = $state(false);
	let completed = $state(false);
	let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

	let totalQuestions = $derived(questions.length);
	let currentQuestion = $derived(questions[currentIndex] || null);
	let progress = $derived(totalQuestions > 0 ? ((currentIndex + (isChecked ? 1 : 0)) / totalQuestions) * 100 : 0);

	let totalXp = $derived(correctCount * 5);

	// Confetti pieces
	let confettiPieces = $state<{ x: number; color: string; delay: number; duration: number; size: number; rotation: number }[]>([]);
	let confettiTimer: ReturnType<typeof setTimeout> | null = null;

	function selectOption(idx: number) {
		if (isChecked) return;
		selectedOption = idx;
	}

	function checkAnswer() {
		if (selectedOption === null) return;
		isChecked = true;
		const correctIdx = currentQuestion.correctIndex ?? currentQuestion.correct_index;
		isCorrect = selectedOption === correctIdx;

		if (isCorrect) {
			correctCount++;
			// Mark mastered if in practice queue
			queueMaster(contentBlock.id, currentIndex, currentQuestion.question || currentQuestion.text, correctIdx);
			// Auto advance after 1.2s for correct
			autoAdvanceTimer = setTimeout(() => {
				goNext();
			}, 1200);
		} else {
			// Queue wrong answer for practice
			queueWrong(contentBlock.id, currentIndex, currentQuestion.question || currentQuestion.text, correctIdx);
		}
	}

	async function queueWrong(blockId: string, questionRef: number, prompt: string, answer: string | number) {
		try {
			await fetch('/api/practice/queue', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ blockId, questionRef: String(questionRef), prompt, correctAnswer: String(answer) })
			});
		} catch { /* offline */ }
	}

	async function queueMaster(blockId: string, questionRef: number, prompt: string, answer: string | number) {
		try {
			// First try to find matching queue item
			const res = await fetch(`/api/practice/queue`);
			if (res.ok) {
				const json = await res.json();
				const item = (json.data || []).find((i: any) => i.block_id === blockId && i.question_ref === String(questionRef));
				if (item) {
					await fetch('/api/practice/queue', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ id: item.id })
					});
				}
			}
		} catch { /* offline */ }
	}

	function goNext() {
		if (currentIndex < totalQuestions - 1) {
			currentIndex++;
			selectedOption = null;
			isChecked = false;
			isCorrect = false;
		} else {
			completed = true;
			pushXpGain(totalXp);
			dispatchConfetti();
		}
	}

	function handleContinue() {
		onComplete?.(correctCount, totalQuestions, totalXp);
		dispatch('complete', { score: correctCount, total: totalQuestions, xp: totalXp });
	}

	function dispatchConfetti() {
		const colors = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];
		const pieces = [];
		for (let i = 0; i < 50; i++) {
			pieces.push({
				x: Math.random() * 100,
				color: colors[Math.floor(Math.random() * colors.length)],
				delay: Math.random() * 0.5,
				duration: 2 + Math.random() * 2,
				size: 4 + Math.random() * 6,
				rotation: Math.random() * 360
			});
		}
		confettiPieces = pieces;
		confettiTimer = setTimeout(() => {
			confettiPieces = [];
		}, 4000);
	}

	onDestroy(() => {
		if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
		if (confettiTimer) clearTimeout(confettiTimer);
	});
</script>

<div class="quiz-container">
	{#if completed}
		<div class="complete-screen">
			{#if confettiPieces.length > 0}
				<div class="confetti-container">
					{#each confettiPieces as piece}
						<div
							class="confetti"
							style="
								left: {piece.x}%;
								background: {piece.color};
								animation-delay: {piece.delay}s;
								animation-duration: {piece.duration}s;
								width: {piece.size}px;
								height: {piece.size}px;
								transform: rotate({piece.rotation}deg);
							"
						></div>
					{/each}
				</div>
			{/if}

			<div class="trophy">🏆</div>
			<h2>Selesai!</h2>
			<div class="score">{correctCount} / {totalQuestions}</div>
			<div class="xp-badge">+{totalXp} XP</div>
			<button class="btn-finish" onclick={handleContinue}>Lanjut</button>
		</div>
	{:else if currentQuestion}
		<div class="progress-container">
			<div class="progress-text">{currentIndex + 1}/{totalQuestions}</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {progress}%"></div>
			</div>
		</div>

		<div class="question-card">
			<p class="question-text">{currentQuestion.question || currentQuestion.text}</p>
		</div>

		<div class="options-grid">
			{#each (currentQuestion.options || currentQuestion.choices || []) as option, idx}
				<button
					class="option-card"
					class:selected={selectedOption === idx}
					class:correct={isChecked && idx === (currentQuestion.correctIndex ?? currentQuestion.correct_index)}
					class:wrong={isChecked && selectedOption === idx && idx !== (currentQuestion.correctIndex ?? currentQuestion.correct_index)}
					disabled={isChecked}
					onclick={() => selectOption(idx)}
				>
					<span class="option-letter">{String.fromCharCode(65 + idx)}</span>
					<span class="option-text">{option}</span>
					{#if isChecked && idx === (currentQuestion.correctIndex ?? currentQuestion.correct_index)}
						<span class="status-icon correct-icon">✓</span>
					{:else if isChecked && selectedOption === idx}
						<span class="status-icon wrong-icon">✗</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="footer">
			{#if isChecked && !isCorrect}
				<div class="explanation">
					{#if currentQuestion.explanation}
						{currentQuestion.explanation}
					{/if}
				</div>
			{/if}

			{#if isChecked && isCorrect}
				<button class="btn-next success-bg" onclick={goNext}>Lanjut</button>
			{:else if isChecked && !isCorrect}
				<button class="btn-next danger-bg" onclick={goNext}>Lanjut</button>
			{:else}
				<button class="btn-check" onclick={checkAnswer} disabled={selectedOption === null}>Check</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.quiz-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 16px;
	}

	.progress-container { margin-bottom: 24px; display: flex; flex-direction: column; gap: 8px; }
	.progress-text { font-size: 13px; font-weight: 600; color: #94a3b8; }
	.progress-bar { height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; }
	.progress-fill { height: 100%; background: var(--accent, #4F46E5); border-radius: 4px; transition: width 0.3s ease; }

	.question-card { background: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
	.question-text { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0; line-height: 1.5; }

	.options-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
	.option-card {
		display: flex; align-items: center; gap: 16px;
		padding: 16px; background: white;
		border: 2px solid var(--border, #E2E8F0);
		border-radius: 12px; text-align: left;
		cursor: pointer; transition: all 0.2s;
		box-shadow: 0 2px 0 rgba(0,0,0,0.02);
	}
	.option-card:hover:not(:disabled) { border-color: #cbd5e1; transform: translateY(-1px); }
	.option-card:active:not(:disabled) { transform: translateY(1px); box-shadow: none; }
	.selected { border-color: var(--accent); background: rgba(79,70,229,0.05); }
	.correct { border-color: var(--success, #22C55E); background: rgba(34,197,94,0.05); animation: pop 0.3s ease; }
	.wrong { border-color: var(--error, #EF4444); background: rgba(239,68,68,0.05); animation: shake 0.4s ease; }

	@keyframes pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
	@keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }

	.option-letter { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 8px; background: rgba(0,0,0,0.03); font-weight: 600; font-size: 14px; color: #64748b; }
	.selected .option-letter { background: var(--accent); color: white; }
	.correct .option-letter { background: var(--success); color: white; }
	.wrong .option-letter { background: var(--error); color: white; }
	.option-text { flex: 1; font-size: 15px; font-weight: 500; color: #334155; }
	.status-icon { font-size: 18px; font-weight: 700; margin-left: auto; }
	.correct-icon { color: var(--success, #22C55E); }
	.wrong-icon { color: var(--error, #EF4444); }

	.footer { text-align: center; display: flex; flex-direction: column; gap: 16px; }
	.explanation { background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.1); padding: 16px; border-radius: 12px; font-size: 14px; color: #64748b; text-align: left; font-style: italic; }
	
	.btn-check, .btn-next {
		padding: 14px 32px; border: none; border-radius: 12px;
		font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;
		box-shadow: 0 4px 0 rgba(0,0,0,0.1);
	}
	.btn-check { background: var(--accent, #4F46E5); color: white; box-shadow: 0 4px 0 rgba(79,70,229,0.2); }
	.btn-check:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }
	.btn-check:hover:not(:disabled) { background: #4338CA; transform: translateY(-1px); }
	.btn-check:active:not(:disabled) { transform: translateY(4px); box-shadow: none; }
	
	.success-bg { background: var(--success, #22C55E); color: white; box-shadow: 0 4px 0 rgba(34,197,94,0.2); }
	.success-bg:hover { background: #16A34A; }
	.danger-bg { background: var(--error, #EF4444); color: white; box-shadow: 0 4px 0 rgba(239,68,68,0.2); }
	.danger-bg:hover { background: #DC2626; }

	.complete-screen {
		text-align: center; padding: 48px 24px;
		background: white; border-radius: 20px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.05);
		position: relative; overflow: hidden;
	}
	.trophy { font-size: 72px; margin-bottom: 24px; animation: bounce 1s ease infinite; }
	@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
	h2 { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 16px; }
	.score { font-size: 48px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
	.xp-badge { font-size: 24px; font-weight: 700; color: var(--success, #22C55E); margin-bottom: 32px; }
	.btn-finish { padding: 16px 48px; background: var(--accent, #4F46E5); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 0 rgba(79,70,229,0.2); transition: all 0.2s; }
	.btn-finish:hover { background: #4338CA; transform: translateY(-2px); }
	.btn-finish:active { transform: translateY(4px); box-shadow: none; }

	.confetti-container { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 10; }
	.confetti { position: absolute; top: -20px; border-radius: 2px; opacity: 0; animation: confetti-fall linear forwards; }
	@keyframes confetti-fall { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(400px) rotate(720deg); } }
</style>
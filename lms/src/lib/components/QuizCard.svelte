<script lang="ts">
	import type { QuizQuestion } from '$lib/utils/quiz';

	let {
		questions,
		moduleSlug,
		sessionId
	}: {
		questions: QuizQuestion[];
		moduleSlug: string;
		sessionId?: string;
	} = $props();

	let currentIndex = $state(0);
	let selectedIndex = $state<number | null>(null);
	let answered = $state(false);
	let score = $state(0);
	let answeredSet = $state<Set<number>>(new Set());

	let currentQuestion = $derived(questions[currentIndex]);
	let totalQuestions = $derived(questions.length);
	let answeredCount = $derived(answeredSet.size);
	let allAnswered = $derived(answeredSet.size === totalQuestions);

	function selectOption(index: number) {
		if (answered) return;
		selectedIndex = index;
		answered = true;
		if (index === currentQuestion.correctIndex) {
			score++;
		}
		answeredSet.add(currentIndex);
	}

	function nextQuestion() {
		if (currentIndex < totalQuestions - 1) {
			currentIndex++;
			selectedIndex = null;
			answered = false;
		}
	}

	function prevQuestion() {
		if (currentIndex > 0) {
			currentIndex--;
			selectedIndex = null;
			answered = false;
		}
	}

	function goToQuestion(index: number) {
		currentIndex = index;
		selectedIndex = null;
		answered = false;
	}

	function resetQuiz() {
		currentIndex = 0;
		selectedIndex = null;
		answered = false;
		score = 0;
		answeredSet = new Set();
	}
</script>

<div class="quiz-card">
	<div class="quiz-header">
		<h3>🧪 Quiz{moduleSlug ? ` — ${moduleSlug.replace(/-/g, ' ')}` : ''}</h3>
		<div class="quiz-score">
			{score}/{answeredCount} benar
		</div>
	</div>

	{#if allAnswered}
		<div class="quiz-result">
			<h4>
				{score === totalQuestions ? '🎉 Sempurna!' :
				 score >= totalQuestions * 0.7 ? '👍 Bagus!' :
				 '📚 Ayo belajar lagi!'}
			</h4>
			<p>Kamu menjawab <strong>{score}</strong> dari <strong>{totalQuestions}</strong> pertanyaan dengan benar.</p>
			{#if score < totalQuestions}
				<p class="result-hint">Klik nomor soal di bawah untuk meninjau jawaban.</p>
			{/if}
			<button class="quiz-btn reset-btn" onclick={resetQuiz}>🔄 Ulangi Quiz</button>
		</div>
	{/if}

	<div class="quiz-body" class:hidden={allAnswered}>
		<p class="question-text">
			<span class="question-num">{currentIndex + 1}.</span>
			{@html currentQuestion.question}
		</p>

		<div class="options-list">
			{#each currentQuestion.options as option, i}
				{@const isCorrect = i === currentQuestion.correctIndex}
				{@const isSelected = i === selectedIndex}
				{@const showFeedback = answered}
				<button
					class="option-btn"
					class:selected={isSelected}
					class:correct={showFeedback && isCorrect}
					class:incorrect={showFeedback && isSelected && !isCorrect}
					class:dimmed={showFeedback && !isCorrect && !isSelected}
					disabled={answered}
					onclick={() => selectOption(i)}
				>
					<span class="option-letter">{String.fromCharCode(65 + i)}</span>
					<span class="option-text">{option}</span>
					{#if showFeedback && isCorrect}
						<span class="option-icon">✓</span>
					{:else if showFeedback && isSelected && !isCorrect}
						<span class="option-icon">✗</span>
					{/if}
				</button>
			{/each}
		</div>

		{#if answered}
			<div class="feedback-bar" class:correct={selectedIndex === currentQuestion.correctIndex} class:incorrect={selectedIndex !== currentQuestion.correctIndex}>
				{selectedIndex === currentQuestion.correctIndex
					? '✅ Benar!'
					: `❌ Jawaban benar: ${String.fromCharCode(65 + currentQuestion.correctIndex)}`}
			</div>
		{/if}

		<div class="quiz-nav">
			<button class="quiz-btn nav-prev" disabled={currentIndex === 0} onclick={prevQuestion}>
				&larr; Sebelumnya
			</button>

			{#if answered && currentIndex < totalQuestions - 1}
				<button class="quiz-btn nav-next" onclick={nextQuestion}>
					Selanjutnya &rarr;
				</button>
			{:else if answered && currentIndex === totalQuestions - 1}
				<button class="quiz-btn nav-next" onclick={nextQuestion}>
					Lihat Hasil &rarr;
				</button>
			{/if}
		</div>
	</div>

	<div class="quiz-progress">
		{#each questions as _, i}
			<button
				class="dot"
				class:active={i === currentIndex}
				class:answered={answeredSet.has(i)}
				onclick={() => goToQuestion(i)}
				title="Soal {i + 1}"
			>{i + 1}</button>
		{/each}
	</div>
</div>

<style>
	.quiz-card {
		margin-top: 24px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
	}

	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.quiz-header h3 {
		font-size: 16px;
		font-weight: 700;
		margin: 0;
		text-transform: capitalize;
	}

	.quiz-score {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: 4px 12px;
		border-radius: 20px;
	}

	.quiz-body.hidden {
		display: none;
	}

	.question-text {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.5;
		margin-bottom: 16px;
		color: var(--text);
	}

	.question-num {
		color: var(--accent);
		margin-right: 4px;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 14px;
		text-align: left;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.option-btn:not(:disabled):hover {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.option-btn:disabled {
		cursor: default;
		opacity: 1;
	}

	.option-btn.selected {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.option-btn.correct {
		border-color: var(--success, #22c55e);
		background: rgba(34, 197, 94, 0.1);
	}

	.option-btn.incorrect {
		border-color: var(--error, #ef4444);
		background: rgba(239, 68, 68, 0.1);
	}

	.option-btn.dimmed {
		opacity: 0.5;
	}

	.option-letter {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--surface);
		border: 1px solid var(--border);
		font-weight: 700;
		font-size: 13px;
		flex-shrink: 0;
	}

	.option-btn.correct .option-letter {
		background: var(--success, #22c55e);
		color: #fff;
		border-color: var(--success, #22c55e);
	}

	.option-btn.incorrect .option-letter {
		background: var(--error, #ef4444);
		color: #fff;
		border-color: var(--error, #ef4444);
	}

	.option-text {
		flex: 1;
	}

	.option-icon {
		font-size: 18px;
		font-weight: 700;
		flex-shrink: 0;
	}

	.option-btn.correct .option-icon { color: var(--success, #22c55e); }
	.option-btn.incorrect .option-icon { color: var(--error, #ef4444); }

	.feedback-bar {
		padding: 10px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.feedback-bar.correct {
		background: rgba(34, 197, 94, 0.1);
		color: var(--success, #22c55e);
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	.feedback-bar.incorrect {
		background: rgba(239, 68, 68, 0.1);
		color: var(--error, #ef4444);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.quiz-nav {
		display: flex;
		justify-content: space-between;
		gap: 12px;
	}

	.quiz-btn {
		padding: 8px 20px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.quiz-btn:hover:not(:disabled) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.quiz-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.reset-btn {
		margin-top: 12px;
	}

	.quiz-result {
		text-align: center;
		padding: 32px 16px;
	}

	.quiz-result h4 {
		font-size: 20px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.quiz-result p {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}

	.result-hint {
		font-size: 12px;
		opacity: 0.7;
	}

	.quiz-progress {
		display: flex;
		justify-content: center;
		gap: 6px;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--border);
		flex-wrap: wrap;
	}

	.dot {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--bg-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dot:hover {
		border-color: var(--accent);
		background: var(--accent-dim);
		color: var(--accent);
	}

	.dot.active {
		border-color: var(--accent);
		background: var(--accent-dim);
		color: var(--accent);
	}

	.dot.answered {
		background: var(--success, #22c55e);
		border-color: var(--success, #22c55e);
		color: #fff;
	}

	.dot.answered::after {
		content: '✓';
	}
</style>

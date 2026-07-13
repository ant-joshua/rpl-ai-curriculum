<script lang="ts">
	let { contentBlock }: { contentBlock: any } = $props();

	let meta: Record<string, any> = $derived(
		typeof contentBlock.meta === 'string'
			? JSON.parse(contentBlock.meta || '{}')
			: (contentBlock.meta || {})
	);

	let questions: any[] = $derived(meta?.questions || []);
	let selectedAnswers: Record<string, number> = $state({});
	let showResults: Record<string, boolean> = $state({});

	function selectAnswer(qIdx: number, optIdx: number) {
		selectedAnswers[String(qIdx)] = optIdx;
	}

	function checkAnswer(qIdx: number) {
		showResults[String(qIdx)] = true;
	}

	function isCorrect(qIdx: number): boolean {
		const q = questions[qIdx];
		if (!q) return false;
		const correctIdx = q.correctIndex ?? q.correct_index;
		return selectedAnswers[String(qIdx)] === correctIdx;
	}
</script>

<div class="quiz-wrapper">
	<h3 class="quiz-title">{contentBlock.title || 'Quiz'}</h3>

	{#if contentBlock.body_html}
		<div class="quiz-intro markdown-content">{@html contentBlock.body_html}</div>
	{/if}

	{#each questions as question, qIdx}
		<div class="question-card">
			<p class="question-text">{question.question || question.text}</p>

			<div class="options">
				{#each (question.options || question.choices || []) as option, optIdx}
					<button
						class="option-btn"
						class:selected={selectedAnswers[String(qIdx)] === optIdx}
						class:correct={showResults[String(qIdx)] && optIdx === (question.correctIndex ?? question.correct_index)}
						class:wrong={showResults[String(qIdx)] && selectedAnswers[String(qIdx)] === optIdx && optIdx !== (question.correctIndex ?? question.correct_index)}
						onclick={() => selectAnswer(qIdx, optIdx)}
						disabled={showResults[String(qIdx)]}
					>
						<span class="option-letter">{String.fromCharCode(65 + optIdx)}</span>
						<span class="option-text">{option}</span>
						{#if showResults[String(qIdx)] && optIdx === (question.correctIndex ?? question.correct_index)}
							<span class="check-mark">✓</span>
						{:else if showResults[String(qIdx)] && selectedAnswers[String(qIdx)] === optIdx}
							<span class="cross-mark">✗</span>
						{/if}
					</button>
				{/each}
			</div>

			{#if !showResults[String(qIdx)] && selectedAnswers[String(qIdx)] !== undefined}
				<button class="check-btn" onclick={() => checkAnswer(qIdx)}>
					Check Answer
				</button>
			{/if}

			{#if showResults[String(qIdx)]}
				<div class="result-badge" class:correct={isCorrect(qIdx)} class:incorrect={!isCorrect(qIdx)}>
					{#if isCorrect(qIdx)}
						✓ Correct!
					{:else}
						✗ Incorrect
					{/if}
				</div>
				{#if question.explanation}
					<p class="explanation">{question.explanation}</p>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style>
	.quiz-wrapper {
		padding: 0;
	}
	.quiz-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		margin: 0 0 8px;
	}
	.quiz-intro {
		font-size: 14px;
		color: var(--text-secondary);
		margin-bottom: 16px;
		line-height: 1.6;
	}
	.question-card {
		background: rgba(255,255,255,0.02);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 12px;
	}
	.question-text {
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
		margin: 0 0 12px;
		line-height: 1.5;
	}
	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.option-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 10px 14px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
		text-align: left;
		font-size: 14px;
		color: var(--text);
		transition: all 0.12s ease;
	}
	.option-btn:hover:not(:disabled) {
		border-color: var(--accent);
		background: var(--surface-hover);
	}
	.option-btn.selected {
		border-color: var(--accent);
		background: rgba(59, 130, 246, 0.08);
	}
	.option-btn.correct {
		border-color: var(--success, #22c55e);
		background: rgba(34, 197, 94, 0.08);
	}
	.option-btn.wrong {
		border-color: var(--error, #ef4444);
		background: rgba(239, 68, 68, 0.08);
	}
	.option-btn:disabled {
		cursor: default;
		opacity: 0.85;
	}
	.option-letter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 6px;
		background: rgba(255,255,255,0.06);
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}
	.option-text {
		flex: 1;
	}
	.check-mark, .cross-mark {
		font-weight: 700;
		font-size: 16px;
		flex-shrink: 0;
	}
	.check-mark { color: var(--success, #22c55e); }
	.cross-mark { color: var(--error, #ef4444); }
	.check-btn {
		margin-top: 10px;
		padding: 8px 20px;
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		background: var(--accent);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.12s;
	}
	.check-btn:hover {
		background: var(--accent-secondary);
	}
	.result-badge {
		margin-top: 10px;
		padding: 6px 14px;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		display: inline-block;
	}
	.result-badge.correct {
		background: rgba(34, 197, 94, 0.12);
		color: var(--success, #22c55e);
	}
	.result-badge.incorrect {
		background: rgba(239, 68, 68, 0.12);
		color: var(--error, #ef4444);
	}
	.explanation {
		margin: 10px 0 0;
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		font-style: italic;
	}
</style>

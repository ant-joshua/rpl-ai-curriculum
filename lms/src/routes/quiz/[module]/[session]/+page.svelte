<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user } from '$lib/stores/user.svelte';

	let { data } = $props();

	let questions = $state(data.questions);
	let errorMsg = $state(data.error);
	let currentIndex = $state(0);
	let selectedOption = $state<number | null>(null);
	let answered = $state(false);
	let correct = $state<boolean | null>(null);
	let score = $state(0);
	let totalAnswered = $state(0);
	let finished = $state(false);
	let saving = $state(false);
	let results = $state<{ question: string; answer: string; correct: string; isCorrect: boolean }[]>([]);
	let moduleSlug = $state(data.moduleSlug);
	let sessionId = $state(data.sessionId);

	onMount(() => {
		if (!user.isLoggedIn) {
			goto('/login');
		}
	});

	let currentQuestion = $derived(questions[currentIndex]);
	let progress = $derived(questions.length > 0 ? ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100 : 0);

	function selectOption(index: number) {
		if (answered) return;
		selectedOption = index;
	}

	async function checkAnswer() {
		if (selectedOption === null || answered) return;
		answered = true;
		const isCorrect = selectedOption === currentQuestion.correctIndex;
		correct = isCorrect;
		if (isCorrect) score++;

		// Save answer to D1
		saving = true;
		try {
			await fetch('/api/quiz', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-device-id': user.userId || user.deviceId,
				},
				body: JSON.stringify({
					module_slug: moduleSlug,
					session_id: sessionId,
					question: currentQuestion.question,
					user_answer: currentQuestion.options[selectedOption],
					correct_answer: currentQuestion.options[currentQuestion.correctIndex],
					correct: isCorrect ? 1 : 0,
				}),
			});
		} catch {
			// silent fail
		} finally {
			saving = false;
		}
	}

	function nextQuestion() {
		results.push({
			question: currentQuestion.question,
			answer: currentQuestion.options[selectedOption ?? 0],
			correct: currentQuestion.options[currentQuestion.correctIndex],
			isCorrect: correct ?? false,
		});
		totalAnswered++;
		if (currentIndex < questions.length - 1) {
			currentIndex++;
			selectedOption = null;
			answered = false;
			correct = null;
		} else {
			finished = true;
		}
	}

	function restart() {
		currentIndex = 0;
		selectedOption = null;
		answered = false;
		correct = null;
		score = 0;
		totalAnswered = 0;
		finished = false;
		results = [];
	}
</script>

<div class="quiz-page">
	<div class="quiz-header">
		<a href="/quiz" class="back-link">&larr; Daftar Quiz</a>
		<h1>📝 Quiz</h1>
		<p class="subtitle">Modul: {moduleSlug} — Sesi: {sessionId}</p>
	</div>

	{#if errorMsg}
		<div class="error-state">
			<p>{errorMsg}</p>
			<button class="btn-secondary" onclick={() => goto('/quiz')}>Kembali</button>
		</div>
	{:else if finished}
		<div class="result-card">
			<div class="result-icon">
				{score >= Math.ceil(questions.length * 0.7) ? '🎉' : '💪'}
			</div>
			<h2>Quiz Selesai!</h2>
			<div class="score-display">
				<span class="score-num">{score}</span>
				<span class="score-sep">/</span>
				<span class="score-total">{questions.length}</span>
			</div>
			<p class="score-pct">
				{Math.round((score / questions.length) * 100)}% benar
				{score >= Math.ceil(questions.length * 0.7) ? '— Lulus! ✅' : '— Coba lagi'}
			</p>

			<div class="results-list">
				{#each results as r, i}
					<div class="result-item" class:correct={r.isCorrect} class:wrong={!r.isCorrect}>
						<div class="result-q">{i + 1}. {r.question}</div>
						<div class="result-detail">
							<span class="result-your">Jawabanmu: {r.answer}</span>
							{#if !r.isCorrect}
								<span class="result-correct">Benar: {r.correct}</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="result-actions">
				<button class="btn-secondary" onclick={restart}>Ulang Quiz</button>
				<button class="btn-primary" onclick={() => goto('/quiz')}>Kembali</button>
			</div>
		</div>
	{:else if currentQuestion}
		<div class="quiz-progress-bar">
			<div class="quiz-progress-fill" style="width: {progress}%"></div>
		</div>
		<div class="quiz-counter">Soal {currentIndex + 1} dari {questions.length}</div>

		<div class="question-card">
			<h3 class="question-text">{currentQuestion.question}</h3>

			<div class="options-list">
				{#each currentQuestion.options as option, i}
					<button
						class="option-btn"
						class:selected={selectedOption === i}
						class:correct={answered && i === currentQuestion.correctIndex}
						class:wrong={answered && selectedOption === i && i !== currentQuestion.correctIndex}
						onclick={() => selectOption(i)}
						disabled={answered}
					>
						<span class="option-char">{String.fromCharCode(65 + i)}</span>
						<span class="option-text">{option}</span>
						{#if answered && i === currentQuestion.correctIndex}
							<span class="option-check">✓</span>
						{/if}
						{#if answered && selectedOption === i && i !== currentQuestion.correctIndex}
							<span class="option-cross">✕</span>
						{/if}
					</button>
				{/each}
			</div>

			{#if answered}
				<div class="feedback-box" class:correct={correct} class:wrong={!correct}>
					<p class="feedback-result">
						{correct ? '✅ Benar!' : '❌ Salah'}
					</p>
					<p class="feedback-explain">{currentQuestion.explanation}</p>
				</div>
			{/if}

			<div class="question-actions">
				{#if !answered}
					<button
						class="btn-primary"
						onclick={checkAnswer}
						disabled={selectedOption === null || saving}
					>
						{saving ? 'Menyimpan...' : 'Cek Jawaban'}
					</button>
				{:else}
					<button class="btn-primary" onclick={nextQuestion}>
						{currentIndex < questions.length - 1 ? 'Soal Selanjutnya →' : 'Lihat Hasil'}
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.quiz-page {
		max-width: 700px;
		margin: 0 auto;
		padding: 20px 0;
	}

	.quiz-header {
		margin-bottom: 24px;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 12px;
		color: var(--accent);
		font-size: 14px;
		text-decoration: none !important;
	}

	.back-link:hover { text-decoration: underline !important; }

	h1 {
		font-size: 24px;
		color: var(--text);
		margin-bottom: 4px;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 13px;
	}

	.error-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--text-secondary);
	}

	.btn-primary {
		padding: 10px 20px;
		background: var(--accent);
		color: #fff;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-primary:hover:not(:disabled) { opacity: 0.9; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

	.btn-secondary {
		padding: 10px 20px;
		background: var(--surface);
		color: var(--text);
		border: 1px solid var(--border);
		border-radius: 10px;
		font-size: 14px;
		cursor: pointer;
	}

	.quiz-progress-bar {
		height: 6px;
		background: var(--bg-secondary);
		border-radius: 3px;
		margin-bottom: 16px;
		overflow: hidden;
	}

	.quiz-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.quiz-counter {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 16px;
	}

	.question-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
	}

	.question-text {
		font-size: 18px;
		color: var(--text);
		margin-bottom: 20px;
		line-height: 1.5;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-bottom: 20px;
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border: 2px solid var(--border);
		border-radius: 10px;
		background: var(--bg-secondary);
		color: var(--text);
		font-size: 14px;
		cursor: pointer;
		transition: all 0.15s;
		text-align: left;
		font-family: inherit;
		width: 100%;
	}

	.option-btn:hover:not(:disabled) {
		border-color: var(--accent);
		background: var(--hover);
	}

	.option-btn.selected {
		border-color: var(--accent);
		background: var(--accent-dim);
	}

	.option-btn.correct {
		border-color: #2ecc71;
		background: rgba(46, 204, 113, 0.1);
	}

	.option-btn.wrong {
		border-color: #e74c3c;
		background: rgba(231, 76, 60, 0.1);
	}

	.option-char {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--surface);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 13px;
		flex-shrink: 0;
	}

	.option-btn.correct .option-char {
		background: #2ecc71;
		color: #fff;
		border-color: #2ecc71;
	}

	.option-btn.wrong .option-char {
		background: #e74c3c;
		color: #fff;
		border-color: #e74c3c;
	}

	.option-text { flex: 1; }
	.option-check { color: #2ecc71; font-weight: bold; }
	.option-cross { color: #e74c3c; font-weight: bold; }

	.feedback-box {
		padding: 16px;
		border-radius: 10px;
		margin-bottom: 20px;
	}

	.feedback-box.correct {
		background: rgba(46, 204, 113, 0.1);
		border: 1px solid rgba(46, 204, 113, 0.3);
	}

	.feedback-box.wrong {
		background: rgba(231, 76, 60, 0.1);
		border: 1px solid rgba(231, 76, 60, 0.3);
	}

	.feedback-result {
		font-weight: 700;
		font-size: 16px;
		margin-bottom: 6px;
		color: var(--text);
	}

	.feedback-explain {
		font-size: 14px;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.question-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	/* Results */
	.result-card {
		text-align: center;
		padding: 40px 20px;
	}

	.result-icon { font-size: 48px; margin-bottom: 16px; }
	.result-card h2 { font-size: 24px; color: var(--text); margin-bottom: 16px; }

	.score-display {
		font-size: 48px;
		font-weight: 700;
		margin-bottom: 8px;
	}

	.score-num { color: var(--accent); }
	.score-sep { color: var(--text-secondary); }
	.score-total { color: var(--text-secondary); }

	.score-pct {
		font-size: 16px;
		color: var(--text-secondary);
		margin-bottom: 32px;
	}

	.results-list {
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 32px;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.result-item {
		padding: 14px;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--surface);
	}

	.result-item.correct {
		border-color: rgba(46, 204, 113, 0.3);
	}

	.result-item.wrong {
		border-color: rgba(231, 76, 60, 0.3);
	}

	.result-q {
		font-size: 14px;
		color: var(--text);
		margin-bottom: 6px;
		font-weight: 500;
	}

	.result-detail {
		font-size: 13px;
		color: var(--text-secondary);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.result-correct {
		color: #2ecc71;
	}

	.result-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
	}
</style>

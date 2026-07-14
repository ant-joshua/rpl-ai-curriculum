<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';

	// State
	let loading = $state(true);
	let error = $state('');
	let assessment: any = $state(null);
	let questions: any[] = $state([]);
	let attemptsRemaining = $state(0);
	let attemptsUsed = $state(0);

	// Timer
	let timeLimitMinutes = $state(0);
	let secondsRemaining = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = $state(null);
	let timeExpired = $state(false);

	// Answers state
	let answers: Record<string, string> = $state({});
	let flaggedQuestions: Set<string> = $state(new Set());

	// UI state
	let currentQuestionIndex = $state(0);
	let submitting = $state(false);
	let submitted = $state(false);
	let confirmSubmit = $state(false);

	// Results
	let resultData: any = $state(null);

	let assessmentId = $state('');

	$effect(() => {
		if (browser) {
			assessmentId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadAssessment();
	});

	async function loadAssessment() {
		loading = true;
		error = '';
		try {
			const res = await api(`/api/my/assessments/${assessmentId}/attempt`);
			if (!res.success) {
				error = res.error || 'Failed to load assessment';
				return;
			}
			const d = res.data!;
			assessment = d.assessment;
			questions = d.questions || [];

			if (d.attemptsRemaining <= 0 && (d.previousAttempts || []).length > 0) {
				// Show last result
				submitted = true;
				resultData = d.previousAttempts[d.previousAttempts.length - 1];
				loading = false;
				return;
			}

			attemptsRemaining = d.attemptsRemaining;
			attemptsUsed = d.attemptsUsed;

			// Init answers
			for (const q of questions) {
				if (!answers[q.id]) answers[q.id] = '';
			}

			// Timer
			if (assessment.time_limit_minutes) {
				timeLimitMinutes = assessment.time_limit_minutes;
				secondsRemaining = assessment.time_limit_minutes * 60;
				startTimer();
			}

		} catch {
			error = 'Network error';
		} finally {
			loading = false;
		}
	}

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			secondsRemaining--;
			if (secondsRemaining <= 0) {
				secondsRemaining = 0;
				timeExpired = true;
				if (timerInterval) clearInterval(timerInterval);
				handleSubmit();
			}
		}, 1000);
	}

	function formatTime(secs: number): string {
		const m = Math.floor(secs / 60);
		const s = secs % 60;
		return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}

	function answeredCount(): number {
		return questions.filter(q => answers[q.id]?.trim() !== '').length;
	}

	function flaggedCount(): number {
		return flaggedQuestions.size;
	}

	function toggleFlag(qId: string) {
		const next = new Set(flaggedQuestions);
		if (next.has(qId)) next.delete(qId);
		else next.add(qId);
		flaggedQuestions = next;
	}

	function goToQuestion(idx: number) {
		currentQuestionIndex = idx;
	}

	function nextQuestion() {
		if (currentQuestionIndex < questions.length - 1) {
			currentQuestionIndex++;
		}
	}

	function prevQuestion() {
		if (currentQuestionIndex > 0) {
			currentQuestionIndex--;
		}
	}

	const question = $derived(questions[currentQuestionIndex] || null);

	function handleConfirmSubmit() {
		confirmSubmit = true;
	}

	async function handleSubmit() {
		if (submitting) return;
		submitting = true;
		confirmSubmit = false;

		const ansArray = questions.map(q => ({
			questionId: q.id,
			answer: answers[q.id] || '',
		}));

		const timeSpent = assessment.time_limit_minutes
			? (assessment.time_limit_minutes * 60) - secondsRemaining
			: 0;

		try {
			const res = await api(`/api/my/assessments/${assessmentId}/attempt`, {
				method: 'POST',
				body: JSON.stringify({ answers: ansArray, timeSpent }),
			});
			if (!res.success) {
				error = res.error || 'Submission failed';
				submitting = false;
				return;
			}
			resultData = res.data;
			submitted = true;
			if (timerInterval) clearInterval(timerInterval);
		} catch {
			error = 'Network error';
			submitting = false;
		}
	}

	function handleRetry() {
		answers = {};
		flaggedQuestions = new Set();
		currentQuestionIndex = 0;
		submitted = false;
		resultData = null;
		confirmSubmit = false;
		error = '';
		secondsRemaining = assessment.time_limit_minutes ? assessment.time_limit_minutes * 60 : 0;
		if (assessment.time_limit_minutes) startTimer();
	}

	function getOptionLabel(idx: number): string {
		return String.fromCharCode(65 + idx); // A, B, C, D...
	}

	// Result screen helpers
	function scoreColor(pct: number): string {
		if (pct >= 80) return 'var(--color-green, #2ecc71)';
		if (pct >= 60) return 'var(--color-yellow, #f1c40f)';
		return 'var(--color-red, #e74c3c)';
	}
</script>

<svelte:head>
	<title>{assessment?.title || 'Assessment'} — RPL AI Curriculum</title>
</svelte:head>

<div class="quiz-player">
	{#if loading}
		<div class="loading">Loading assessment...</div>
	{:else if error}
		<div class="error-state">
			<p>{error}</p>
			<button class="btn btn-primary" onclick={() => loadAssessment()}>Retry</button>
		</div>
	{:else if submitted && resultData}
		<!-- Result Screen -->
		<div class="result-screen">
			<div class="result-header">
				<h1>{assessment?.title || 'Assessment'}</h1>
			</div>

			{#if resultData.results}
				<div class="result-score" style="--score-color: {scoreColor(resultData.percentage)}">
					<div class="score-circle">
						<span class="score-pct">{resultData.percentage}%</span>
						<span class="score-fraction">{resultData.score} / {resultData.maxScore}</span>
					</div>
					<div class="score-status" class:passed={resultData.passed} class:failed={!resultData.passed}>
						{resultData.passed ? '✓ PASSED' : '✗ FAILED'}
						<span class="passing-info">(passing: {resultData.passingScore}%)</span>
					</div>
				</div>

				{#if resultData.showResults}
					<div class="result-breakdown">
						<h3>Answer Review</h3>
						{#each resultData.results as r, i}
							<div class="result-item" class:correct={r.correct} class:wrong={!r.correct}>
								<div class="result-q-header">
									<span class="result-q-num">Q{i + 1}</span>
									<span class="result-q-status">
										{r.correct ? '✓ Correct' : '✗ Incorrect'}
									</span>
									<span class="result-q-points">{r.pointsAwarded}/{r.points} pts</span>
								</div>
								<div class="result-q-detail">
									<p class="result-q-text">{questions[i]?.question || ''}</p>
									{#if !r.correct}
										<div class="result-answer-compare">
											<div class="result-user-answer">
												<span class="label">Your answer:</span>
												<span class="value wrong">{r.userAnswer || '(no answer)'}</span>
											</div>
											<div class="result-correct-answer">
												<span class="label">Correct answer:</span>
												<span class="value correct">{r.correctAnswer}</span>
											</div>
										</div>
									{:else}
										<div class="result-answer-correct">
											<span class="label">Your answer:</span>
											<span class="value correct">{r.userAnswer}</span>
										</div>
									{/if}
									{#if r.explanation}
										<div class="result-explanation">
											<span class="label">Explanation:</span>
											<p>{r.explanation}</p>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="result-actions">
					<button class="btn btn-outline" onclick={() => goto('/my/grades')}>
						Back to Grades
					</button>
					{#if attemptsRemaining > 0}
						<button class="btn btn-primary" onclick={handleRetry}>
							Retry ({attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} left)
						</button>
					{/if}
				</div>

			{:else}
				<!-- Previous attempt without results -->
				<div class="result-score">
					<div class="score-circle">
						<span class="score-pct">Score: {resultData.score ?? '?'}</span>
					</div>
				</div>
				<div class="result-actions">
					<button class="btn btn-outline" onclick={() => goto('/my/grades')}>Back to Grades</button>
				</div>
			{/if}
		</div>

	{:else if assessment}
		<!-- Quiz Player -->
		<div class="quiz-header">
			<div class="quiz-title-section">
				<h1>{assessment.title}</h1>
				<span class="quiz-type-badge badge--{assessment.type}">{assessment.type}</span>
			</div>

			{#if timeLimitMinutes > 0}
				<div class="quiz-timer" class:timer-warning={secondsRemaining <= 60} class:timer-critical={secondsRemaining <= 30}>
					<span class="timer-icon">⏱️</span>
					<span class="timer-value">{formatTime(secondsRemaining)}</span>
				</div>
			{/if}
		</div>

		<div class="quiz-body">
			<!-- Question Navigation Sidebar -->
			<aside class="question-nav">
				<div class="nav-stats">
					<div class="stat-item">
						<span class="stat-value">{answeredCount()}</span>
						<span class="stat-label">Answered</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{flaggedCount()}</span>
						<span class="stat-label">Flagged</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{questions.length - answeredCount()}</span>
						<span class="stat-label">Remaining</span>
					</div>
				</div>

				<div class="nav-questions">
					{#each questions as q, i}
						<button
							class="nav-q-btn"
							class:active={i === currentQuestionIndex}
							class:answered={answers[q.id]?.trim() !== ''}
							class:flagged={flaggedQuestions.has(q.id)}
							onclick={() => goToQuestion(i)}
							title="{q.question?.slice(0, 80)}..."
						>
							{i + 1}
						</button>
					{/each}
				</div>
			</aside>

			<!-- Question Display -->
			<div class="question-display">
				{#if question}
					<div class="question-progress">
						Question {currentQuestionIndex + 1} of {questions.length}
					</div>

					<div class="question-card">
						<div class="question-text">
							<p>{question.question}</p>
						</div>

						{#if question.type === 'multiple_choice' || question.type === 'true_false'}
							<div class="options-list">
								{#each question.options as opt, oi}
									<label class="option-item" class:selected={answers[question.id] === String(oi)}>
										<input
											type="radio"
											name={`q-${question.id}`}
											value={String(oi)}
											checked={answers[question.id] === String(oi)}
											onchange={() => { answers[question.id] = String(oi); }}
										/>
										<span class="option-indicator">
											{#if answers[question.id] === String(oi)}
												<span class="radio-dot"></span>
											{/if}
										</span>
										<span class="option-label">{getOptionLabel(oi)}</span>
										<span class="option-text">{opt}</span>
									</label>
								{/each}
							</div>

						{:else if question.type === 'short_answer'}
							<div class="short-answer">
								<textarea
									placeholder="Type your answer..."
									value={answers[question.id] || ''}
									oninput={(e) => { answers[question.id] = (e.target as HTMLTextAreaElement).value; }}
									rows="3"
								></textarea>
							</div>

						{:else if question.type === 'essay'}
							<div class="essay-answer">
								<textarea
									placeholder="Write your essay answer..."
									value={answers[question.id] || ''}
									oninput={(e) => { answers[question.id] = (e.target as HTMLTextAreaElement).value; }}
									rows="8"
								></textarea>
							</div>
						{/if}

						<div class="question-actions">
							<button
								class="btn btn-sm btn-ghost"
								class:flagged-btn={flaggedQuestions.has(question.id)}
								onclick={() => toggleFlag(question.id)}
							>
								{flaggedQuestions.has(question.id) ? '🚩 Flagged' : '🏳️ Flag for review'}
							</button>
						</div>
					</div>

					<div class="question-navigation">
						<button class="btn btn-outline" onclick={prevQuestion} disabled={currentQuestionIndex === 0}>
							← Previous
						</button>

						{#if currentQuestionIndex < questions.length - 1}
							<button class="btn btn-primary" onclick={nextQuestion}>
								Next →
							</button>
						{:else}
							<button class="btn btn-success" onclick={handleConfirmSubmit} disabled={submitting}>
								{submitting ? 'Submitting...' : 'Submit Assessment'}
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Submit Confirmation Modal -->
		{#if confirmSubmit}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="modal-overlay" onclick={() => confirmSubmit = false} role="button" tabindex="-1">
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog">
					<h3>Submit Assessment?</h3>
					<div class="modal-stats">
						<p>Answered: <strong>{answeredCount()} / {questions.length}</strong></p>
						<p>Flagged: <strong>{flaggedCount()}</strong></p>
						{#if answeredCount() < questions.length}
							<p class="warning">⚠️ You have unanswered questions remaining.</p>
						{/if}
						{#if timeExpired}
							<p class="warning">⏰ Time has expired.</p>
						{/if}
					</div>
					<div class="modal-actions">
						<button class="btn btn-outline" onclick={() => confirmSubmit = false}>Continue Reviewing</button>
						<button class="btn btn-primary" onclick={handleSubmit} disabled={submitting}>
							{submitting ? 'Submitting...' : 'Submit'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(body) {
		background: var(--bg);
		color: var(--text);
	}

	.quiz-player {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px 16px;
	}

	.loading, .error-state {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}

	.error-state p {
		margin-bottom: 16px;
		color: var(--color-red, #e74c3c);
	}

	/* Header */
	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 12px;
	}

	.quiz-title-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.quiz-title-section h1 {
		font-size: 22px;
		font-weight: 700;
	}

	.quiz-type-badge {
		padding: 3px 10px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: var(--accent-dim);
		color: var(--accent);
	}

	.badge--midterm, .badge--final { background: #e74c3c33; color: #e74c3c; }
	.badge--practice { background: #2ecc7133; color: #2ecc71; }
	.badge--exercise { background: #f39c1233; color: #f39c12; }

	/* Timer */
	.quiz-timer {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--border);
		font-size: 20px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.timer-icon { font-size: 18px; }

	.timer-warning {
		border-color: #f39c12;
		color: #f39c12;
		background: #f39c1215;
	}

	.timer-critical {
		border-color: #e74c3c;
		color: #e74c3c;
		background: #e74c3c15;
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	/* Body */
	.quiz-body {
		display: flex;
		gap: 24px;
	}

	/* Question Nav Sidebar */
	.question-nav {
		width: 180px;
		min-width: 180px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 16px;
		position: sticky;
		top: 24px;
		align-self: flex-start;
	}

	.nav-stats {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}

	.stat-item {
		flex: 1;
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 18px;
		font-weight: 700;
	}

	.stat-label {
		font-size: 10px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.nav-questions {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}

	.nav-q-btn {
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.nav-q-btn:hover {
		background: var(--hover);
		border-color: var(--accent);
	}

	.nav-q-btn.active {
		background: var(--accent-dim);
		border-color: var(--accent);
		color: var(--accent);
	}

	.nav-q-btn.answered {
		background: #2ecc7115;
		border-color: #2ecc71;
		color: #2ecc71;
	}

	.nav-q-btn.flagged {
		background: #f39c1215;
		border-color: #f39c12;
		color: #f39c12;
	}

	.nav-q-btn.answered.active {
		background: #2ecc7125;
	}

	.nav-q-btn.flagged.active {
		background: #f39c1225;
	}

	/* Question Display */
	.question-display {
		flex: 1;
		min-width: 0;
	}

	.question-progress {
		font-size: 13px;
		color: var(--text-secondary);
		margin-bottom: 12px;
		font-weight: 500;
	}

	.question-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 16px;
	}

	.question-text {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.6;
		margin-bottom: 20px;
		color: var(--text);
	}

	/* Options */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.option-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
	}

	.option-item:hover {
		background: var(--hover);
		border-color: var(--accent);
	}

	.option-item.selected {
		background: var(--accent-dim);
		border-color: var(--accent);
	}

	.option-item input {
		display: none;
	}

	.option-indicator {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 2px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.15s ease;
	}

	.option-item.selected .option-indicator {
		border-color: var(--accent);
		background: var(--accent);
	}

	.radio-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: white;
	}

	.option-label {
		font-weight: 600;
		color: var(--text-secondary);
		font-size: 13px;
		flex-shrink: 0;
	}

	.option-text {
		font-size: 14px;
		color: var(--text);
	}

	/* Text inputs */
	.short-answer textarea,
	.essay-answer textarea {
		width: 100%;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		font-family: inherit;
		line-height: 1.5;
		resize: vertical;
		transition: border-color 0.15s ease;
	}

	.short-answer textarea:focus,
	.essay-answer textarea:focus {
		outline: none;
		border-color: var(--accent);
	}

	.short-answer textarea {
		min-height: 70px;
	}

	.essay-answer textarea {
		min-height: 180px;
	}

	/* Question Actions */
	.question-actions {
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}

	.btn-ghost {
		background: transparent;
		border: none;
		color: var(--text-secondary);
		cursor: pointer;
		font-size: 13px;
	}

	.btn-ghost:hover {
		color: var(--text);
	}

	.flagged-btn {
		color: #f39c12 !important;
	}

	/* Question Nav Buttons */
	.question-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 8px;
	}

	.btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: all 0.15s ease;
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--accent);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.btn-success {
		background: #2ecc71;
		color: white;
	}

	.btn-success:hover:not(:disabled) {
		background: #27ae60;
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text);
	}

	.btn-outline:hover:not(:disabled) {
		background: var(--hover);
		border-color: var(--accent);
	}

	.btn-sm {
		padding: 6px 12px;
		font-size: 12px;
	}

	/* Submit Confirmation Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		max-width: 420px;
		width: 100%;
	}

	.modal h3 {
		font-size: 18px;
		margin-bottom: 16px;
	}

	.modal-stats {
		margin-bottom: 20px;
	}

	.modal-stats p {
		margin: 6px 0;
		font-size: 14px;
		color: var(--text-secondary);
	}

	.modal-stats .warning {
		color: #f39c12;
		margin-top: 10px;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	/* ===== Result Screen ===== */
	.result-screen {
		max-width: 800px;
		margin: 0 auto;
	}

	.result-header h1 {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 24px;
		text-align: center;
	}

	.result-score {
		text-align: center;
		margin-bottom: 32px;
	}

	.score-circle {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 160px;
		height: 160px;
		border-radius: 50%;
		border: 4px solid var(--score-color);
		margin-bottom: 12px;
	}

	.score-pct {
		font-size: 36px;
		font-weight: 800;
		color: var(--score-color);
		line-height: 1;
	}

	.score-fraction {
		font-size: 14px;
		color: var(--text-secondary);
		margin-top: 4px;
	}

	.score-status {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: 1px;
	}

	.score-status.passed { color: #2ecc71; }
	.score-status.failed { color: #e74c3c; }

	.passing-info {
		display: block;
		font-size: 13px;
		font-weight: 400;
		color: var(--text-secondary);
		margin-top: 4px;
	}

	/* Result Breakdown */
	.result-breakdown {
		margin-top: 24px;
	}

	.result-breakdown h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
	}

	.result-item {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px;
		margin-bottom: 12px;
	}

	.result-item.correct {
		border-left: 3px solid #2ecc71;
	}

	.result-item.wrong {
		border-left: 3px solid #e74c3c;
	}

	.result-q-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
	}

	.result-q-num {
		font-weight: 700;
		font-size: 13px;
		color: var(--text-secondary);
	}

	.result-q-status {
		font-size: 13px;
		font-weight: 600;
	}

	.result-item.correct .result-q-status { color: #2ecc71; }
	.result-item.wrong .result-q-status { color: #e74c3c; }

	.result-q-points {
		margin-left: auto;
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.result-q-text {
		font-size: 14px;
		margin-bottom: 10px;
		color: var(--text);
		line-height: 1.5;
	}

	.result-answer-compare {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		display: block;
		margin-bottom: 2px;
	}

	.value {
		font-size: 14px;
		padding: 4px 10px;
		border-radius: 4px;
		display: inline-block;
	}

	.value.correct {
		background: #2ecc7115;
		color: #2ecc71;
	}

	.value.wrong {
		background: #e74c3c15;
		color: #e74c3c;
	}

	.result-explanation {
		margin-top: 10px;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}

	.result-explanation p {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.result-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-top: 32px;
	}

	.result-actions .btn {
		min-width: 160px;
		justify-content: center;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.quiz-body {
			flex-direction: column;
		}

		.question-nav {
			width: 100%;
			min-width: unset;
			position: static;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 12px;
		}

		.nav-stats {
			flex: 1;
			margin-bottom: 0;
			padding-bottom: 0;
			border-bottom: none;
		}

		.nav-questions {
			flex: 2;
			grid-template-columns: repeat(6, 1fr);
		}

		.quiz-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.score-circle {
			width: 130px;
			height: 130px;
		}

		.score-pct {
			font-size: 28px;
		}
	}

	@media (max-width: 480px) {
		.quiz-player {
			padding: 16px 10px;
		}

		.question-card {
			padding: 16px;
		}

		.question-text {
			font-size: 15px;
		}

		.nav-questions {
			grid-template-columns: repeat(5, 1fr);
		}

		.result-actions {
			flex-direction: column;
			align-items: stretch;
		}

		.result-actions .btn {
			width: 100%;
		}
	}
</style>

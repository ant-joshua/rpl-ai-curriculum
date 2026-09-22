<script lang="ts">
	import { t } from '$lib/stores/i18n';
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { StatCard, Button } from '$lib/components/ui';
import { Badge } from '$lib/components/ui';
 
	// State
	let loading = $state(true);
	let error = $state('');
	let assessment: any = $state(null);
	let questions: any[] = $state([]);
	let attemptsRemaining = $state(0);
	let attemptsUsed = $state(0);

	// Practice mode
	let practiceMode = $state(false);
	let showFeedback: Record<number, boolean> = $state({});

	// Timer — uses server-provided startedAt for drift-free countdown
	let timeLimitMinutes = $state(0);
	let startedAt = $state<string | null>(null);  // ISO string from server
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
	let submitError = $state('');

	// Map question index -> essay AI feedback
	let essayFeedback = $derived.by(() => {
		const map: Record<number, string> = {};
		const essayScores = resultData?.essayScores || [];
		essayScores.forEach((es: any) => {
			const idx = questions.findIndex(q => q.id === es.questionId);
			if (idx >= 0) map[idx] = es.feedback;
		});
		return map;
	});

	let assessmentId = $state('');

	$effect(() => {
		if (browser) {
			assessmentId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		practiceMode = $page.url.searchParams.get('practice') === '1';
		loadAssessment();
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	/** Recalculate seconds remaining from startedAt + timeLimitMinutes */
	function recalcRemaining(): number {
		if (!startedAt || !timeLimitMinutes) return 0;
		const startedMs = new Date(startedAt).getTime();
		const elapsed = (Date.now() - startedMs) / 1000;
		const limit = timeLimitMinutes * 60;
		return Math.max(0, limit - Math.floor(elapsed));
	}

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

			if (d.attemptsRemaining <= 0 && (d.previousAttempts || []).length > 0 && !practiceMode) {
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

			// Timer — use server-originated startedAt for drift-free countdown
			if (assessment.time_limit_minutes && !practiceMode) {
				timeLimitMinutes = assessment.time_limit_minutes;
				startedAt = d.startedAt || new Date().toISOString();
				secondsRemaining = recalcRemaining();
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
		// Tick every 500ms for responsive display, recalculate from startedAt
		timerInterval = setInterval(() => {
			const remaining = recalcRemaining();
			secondsRemaining = remaining;

			if (remaining <= 0) {
				secondsRemaining = 0;
				timeExpired = true;
				if (timerInterval) clearInterval(timerInterval);
				handleSubmit();
			}
		}, 500);
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

	function handlePracticeSubmit() {
		if (submitting) return;
		submitting = true;
		// Local-only grading — no server call
		let totalScore = 0;
		let maxScore = 0;
		const results = questions.map((q, i) => {
			const pts = q.points || 1;
			maxScore += pts;
			const correct = (answers[q.id] || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
			if (correct) totalScore += pts;
			return { questionId: q.id, correct, points: pts, pointsAwarded: correct ? pts : 0, explanation: q.explanation || null };
		});
		const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
		resultData = { results, score: totalScore, maxScore, percentage, passed: true, passingScore: 0, showResults: true, xpAwarded: 0, newBadges: [] };
		submitted = true;
		submitting = false;
		if (timerInterval) clearInterval(timerInterval);
	}

	async function handleSubmit() {
		if (submitting) return;
		submitting = true;
		confirmSubmit = false;
		submitError = '';

		const ansArray = questions.map(q => ({
			questionId: q.id,
			answer: answers[q.id] || '',
		}));

		const timeSpent = timeLimitMinutes
			? (timeLimitMinutes * 60) - secondsRemaining
			: 0;

		try {
			const res = await api(`/api/my/assessments/${assessmentId}/attempt`, {
				method: 'POST',
				body: JSON.stringify({ answers: ansArray, timeSpent }),
			});
			if (!res.success) {
				submitError = res.error || 'Submission failed';
				submitting = false;
				return;
			}
			resultData = res.data;
			submitted = true;
			if (timerInterval) clearInterval(timerInterval);
		} catch {
			submitError = 'Network error';
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
		submitError = '';
		// Reset timer with fresh server call
		startedAt = null;
		timeExpired = false;
		loadAssessment();
	}

	function getOptionLabel(idx: number): string {
		return String.fromCharCode(65 + idx); // A, B, C, D...
	}

	// Result screen helpers
	function scoreColor(pct: number): string {
		if (pct >= 80) return 'var(--color-green, var(--success))';
		if (pct >= 60) return 'var(--color-yellow, var(--warning))';
		return 'var(--color-red, var(--danger))';
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
			<Button variant="primary" onclick={() => loadAssessment()}>Retry</Button>
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
					{#if resultData.timeExpired}
						<div class="time-expired-notice">⏰ Time expired — auto-submitted</div>
					{/if}
					{#if resultData.xpAwarded > 0}
						<div class="xp-earned">
							⭐ +{resultData.xpAwarded} XP
							{#if resultData.newBadges?.length > 0}
								<span class="new-badges">
									{#each resultData.newBadges as badge}
										<Badge variant="warning">🏅 {badge.name || 'Badge'}</Badge>
									{/each}
								</span>
							{/if}
						</div>
					{/if}
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
																	{#if essayFeedback[i]}
																		<div class="result-essay-feedback">
																			<span class="label">🤖 AI Feedback:</span>
																			<p>{essayFeedback[i]}</p>
																		</div>
																	{/if}
																</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="result-actions">
					<Button variant="outline" onclick={() => goto('/my/grades')}>
						Back to Grades
					</Button>
					{#if practiceMode}
						<Button variant="primary" onclick={() => { submitted = false; resultData = null; answers = {}; showFeedback = {}; currentQuestionIndex = 0; loadAssessment(); }}>
							🎯 Practice Again
						</Button>
					{/if}
					{#if attemptsRemaining > 0 && !practiceMode}
						<Button variant="primary" onclick={handleRetry}>
							Retry ({attemptsRemaining} attempt{attemptsRemaining > 1 ? 's' : ''} left)
						</Button>
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
					<Button variant="outline" onclick={() => goto('/my/grades')}>Back to Grades</Button>
				</div>
			{/if}
		</div>

	{:else if assessment}
		<!-- Quiz Player -->
		<div class="quiz-header">
			<div class="quiz-title-section">
				<h1>{assessment.title}</h1>
				<Badge variant={assessment.type === 'midterm' || assessment.type === 'final' ? 'danger' : assessment.type === 'practice' ? 'success' : 'warning'}>{assessment.type}</Badge>
				{#if practiceMode}
					<Badge variant="info">🎯 Practice Mode</Badge>
				{/if}
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
			<StatCard icon="✅" value={answeredCount()} label="Answered" />
			<StatCard icon="🚩" value={flaggedCount()} label="Flagged" />
			<StatCard icon="⏳" value={questions.length - answeredCount()} label="Remaining" />
				</div>

				<div class="nav-questions">
					{#each questions as q, i}
						<Button
							variant="ghost"
							size="sm"
							class="nav-q-btn {i === currentQuestionIndex ? 'active' : ''} {answers[q.id]?.trim() !== '' ? 'answered' : ''} {flaggedQuestions.has(q.id) ? 'flagged' : ''}"
							onclick={() => goToQuestion(i)}
							title="{q.question?.slice(0, 80)}..."
						>
							{i + 1}
						</Button>
					{/each}
				</div>
			</aside>

			<!-- Question Display -->
			<div class="question-display">
				{#if submitError}
					<div class="submit-error-banner">
						⚠️ {submitError}
					</div>
				{/if}

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
							<Button
								variant="ghost"
								size="sm"
								class={flaggedQuestions.has(question.id) ? 'flagged-btn' : ''}
								onclick={() => toggleFlag(question.id)}
							>
								{flaggedQuestions.has(question.id) ? '🚩 Flagged' : '🏳️ Flag for review'}
							</Button>
						</div>
					</div>

					<div class="question-navigation">
						<Button variant="outline" onclick={prevQuestion} disabled={currentQuestionIndex === 0}>
							← Previous
						</Button>

						{#if currentQuestionIndex < questions.length - 1}
							<Button variant="primary" onclick={nextQuestion}>
								Next →
							</Button>
						{:else}
							{#if practiceMode}
								<Button variant="primary" onclick={handlePracticeSubmit} disabled={submitting}>
									{submitting ? 'Checking...' : '✅ Check Answers'}
								</Button>
							{:else}
								<Button variant="primary" onclick={handleConfirmSubmit} disabled={submitting}>
									{submitting ? 'Submitting...' : 'Submit Assessment'}
								</Button>
							{/if}
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
						<Button variant="outline" onclick={() => confirmSubmit = false}>Continue Reviewing</Button>
						<Button variant="primary" onclick={handleSubmit} disabled={submitting}>
							{submitting ? 'Submitting...' : 'Submit'}
						</Button>
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
		color: var(--color-red, var(--danger));
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

	.badge--midterm, .badge--final { background: var(--danger)33; color: var(--danger); }
	.badge--practice { background: var(--success)33; color: var(--success); }
	.badge--exercise { background: var(--warning)33; color: var(--warning); }

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
		border-color: var(--warning);
		color: var(--warning);
		background: var(--warning)15;
	}

	.timer-critical {
		border-color: var(--danger);
		color: var(--danger);
		background: var(--danger)15;
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	/* XP Earned */
	.xp-earned {
		display: flex; align-items: center; gap: 8px;
		margin-top: 12px; padding: 10px 16px;
		background: var(--warning-light);
		border: 1px solid var(--warning); border-radius: 10px;
		font-size: 16px; font-weight: 700; color: var(--warning);
	}
	.new-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-left: 8px; }
	.badge-earned {
		padding: 3px 10px; background: var(--surface); border: 1px solid var(--warning);
		border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--warning);
	}

	/* Practice Badge */
	.practice-badge {
		display: inline-block; padding: 4px 12px;
		background: var(--accent-light);
		border: 1px solid var(--accent); border-radius: 6px;
		font-size: 12px; font-weight: 600; color: var(--accent);
	}

	/* Body */
	.quiz-body {
		display: flex;
		gap: 24px;
	}

	/* Error banner */
	.submit-error-banner {
		background: var(--danger)15;
		border: 1px solid var(--danger);
		color: var(--danger);
		padding: 10px 16px;
		border-radius: 8px;
		margin-bottom: 12px;
		font-size: 14px;
		font-weight: 500;
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
		background: var(--success)15;
		border-color: var(--success);
		color: var(--success);
	}

	.nav-q-btn.flagged {
		background: var(--warning)15;
		border-color: var(--warning);
		color: var(--warning);
	}

	.nav-q-btn.answered.active {
		background: var(--success)25;
	}

	.nav-q-btn.flagged.active {
		background: var(--warning)25;
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
		background: var(--surface);
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

	.flagged-btn {
		color: var(--warning) !important;
	}

	/* Question Nav Buttons */
	.question-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 8px;
	}

	/* Submit Confirmation Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: var(--overlay);
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
		color: var(--warning);
		margin-top: 10px;
	}

	.modal-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
	}

	/* Time expired notice on result screen */
	.time-expired-notice {
		margin-top: 12px;
		padding: 8px 16px;
		background: var(--danger)15;
		border: 1px solid var(--danger);
		border-radius: 8px;
		color: var(--danger);
		font-size: 14px;
		font-weight: 600;
		display: inline-block;
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

	.score-status.passed { color: var(--success); }
	.score-status.failed { color: var(--danger); }

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
		border-left: 3px solid var(--success);
	}

	.result-item.wrong {
		border-left: 3px solid var(--danger);
	}

	.result-q-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.result-q-num {
		font-weight: 700;
		font-size: 14px;
		color: var(--text);
	}

	.result-q-status {
		font-size: 13px;
		font-weight: 600;
	}

	.result-item.correct .result-q-status { color: var(--success); }
	.result-item.wrong .result-q-status { color: var(--danger); }

	.result-q-points {
		margin-left: auto;
		font-size: 13px;
		color: var(--text-secondary);
		font-weight: 500;
	}

	.result-q-text {
		font-size: 14px;
		margin-bottom: 8px;
		color: var(--text-secondary);
	}

	.result-answer-compare {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 8px;
	}

	.result-user-answer, .result-correct-answer, .result-answer-correct {
		display: flex;
		gap: 8px;
		font-size: 13px;
	}

	.label {
		font-weight: 600;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.value.wrong { color: var(--danger); }
	.value.correct { color: var(--success); }

	.result-explanation {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--border);
		font-size: 13px;
		color: var(--text-secondary);
	}

	.result-explanation p {
		margin-top: 4px;
		line-height: 1.5;
	}

	.result-essay-feedback {
		margin-top: 8px;
		padding: 10px 12px;
		background: var(--success-light);
		border: 1px solid var(--success);
		border-radius: 8px;
		font-size: 13px;
		color: var(--success);
	}

	.result-essay-feedback p {
		margin-top: 4px;
		line-height: 1.5;
	}

	.result-actions {
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-top: 24px;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.quiz-container { padding: 12px; }
		.quiz-header { flex-direction: column; gap: 10px; }
		.quiz-title-section h1 { font-size: 20px; }
		.quiz-timer { position: static; margin-top: 8px; }
		.quiz-body { flex-direction: column; gap: 16px; }
		.quiz-sidebar { order: -1; flex-direction: row; flex-wrap: wrap; gap: 6px; }
		.q-nav-btn { width: 36px; height: 36px; font-size: 12px; }
		.q-flag-btn { width: 36px; height: 36px; font-size: 12px; }
		.q-number { font-size: 12px; }
		.question-area { padding: 16px; }
		.question-text { font-size: 15px; }
		.option-item { padding: 12px 14px; font-size: 14px; }
		.quiz-nav { flex-direction: column; }
		.quiz-nav .btn { width: 100%; }
		.practice-badge { font-size: 11px; padding: 3px 8px; }
		.xp-earned { font-size: 14px; padding: 8px 12px; flex-wrap: wrap; }
	}
</style>

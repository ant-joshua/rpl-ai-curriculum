<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { Button, Card, Badge } from '$lib/components/ui';

	// ── State ──
	let loading = $state(true);
	let error = $state('');

	// Session
	let sessionId = $state('');
	let started = $state(false);
	let submitted = $state(false);
	let timeExpired = $state(false);

	// Questions
	let questions: any[] = $state([]);
	let answers: Record<string, string> = $state({});
	let flaggedQuestions: Set<string> = $state(new Set());

	// Timer
	let timeLimitMinutes = $state(180);
	let startedAt = $state<string | null>(null);
	let secondsRemaining = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = $state(null);

	// UI
	let currentQuestionIndex = $state(0);
	let submitting = $state(false);
	let confirmSubmit = $state(false);
	let submitError = $state('');

	// Results
	let resultData: any = $state(null);

	let offeringId = $state('');

	// Subtest sections
	const SUBTESTS = [
		{ key: 'tps', label: 'TPS', start: 0, count: 60 },
		{ key: 'literasi', label: 'Literasi Bahasa', start: 60, count: 30 },
		{ key: 'matematika', label: 'Matematika', start: 90, count: 10 },
	];

	let offering = $state<any>(null);

	$effect(() => {
		if (browser) {
			offeringId = $page.url.pathname.split('/')[2] || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadInitial();
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function recalcRemaining(): number {
		if (!startedAt || !timeLimitMinutes) return 0;
		const startedMs = new Date(startedAt).getTime();
		const elapsed = (Date.now() - startedMs) / 1000;
		const limit = timeLimitMinutes * 60;
		return Math.max(0, limit - Math.floor(elapsed));
	}

	async function loadInitial() {
		loading = true;
		error = '';
		try {
			const res = await api(`/api/tryout/${offeringId}`);
			if (!res.success) { error = res.error || 'Failed to load'; return; }
			const d = res.data!;
			offering = d.offering;

			// Check for active session
			if (d.activeSession) {
				// Resume existing session — need to reload full questions
				await resumeSession(d.activeSession);
				return;
			}

			loading = false;
		} catch { error = 'Network error'; }
		finally { loading = false; }
	}

	async function resumeSession(s: any) {
		// Can't resume without questions in memory — force start new
		// Mark old as expired
		started = false;
		loading = false;
	}

	async function startTryOut() {
		loading = true;
		error = '';
		try {
			const res = await api(`/api/tryout/${offeringId}`, {
				method: 'POST',
				body: JSON.stringify({ action: 'start', timeLimitMinutes: 180 }),
			});
			if (!res.success) { error = res.error || 'Failed to start'; loading = false; return; }
			const d = res.data!;
			sessionId = d.sessionId;
			startedAt = d.startedAt;
			timeLimitMinutes = d.timeLimitMinutes;
			questions = d.questions || [];

			// Init answers
			for (const q of questions) {
				if (!answers[q.id]) answers[q.id] = '';
			}

			secondsRemaining = recalcRemaining();
			startTimer();
			started = true;
		} catch { error = 'Network error'; }
		finally { loading = false; }
	}

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);
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
		if (secs <= 0) return '00:00';
		const h = Math.floor(secs / 3600);
		const m = Math.floor((secs % 3600) / 60);
		const s = secs % 60;
		if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
		if (idx >= 0 && idx < questions.length) currentQuestionIndex = idx;
	}

	function nextQuestion() {
		if (currentQuestionIndex < questions.length - 1) currentQuestionIndex++;
	}

	function prevQuestion() {
		if (currentQuestionIndex > 0) currentQuestionIndex--;
	}

	const currentQuestion = $derived(questions[currentQuestionIndex] || null);

	function selectAnswer(optLabel: string) {
		if (!currentQuestion) return;
		answers[currentQuestion.id] = optLabel;
	}

	function handleConfirmSubmit() {
		confirmSubmit = true;
	}

	async function handleSubmit() {
		if (submitting) return;
		submitting = true;
		confirmSubmit = false;
		submitError = '';

		try {
			const res = await api(`/api/tryout/${offeringId}`, {
				method: 'POST',
				body: JSON.stringify({
					action: 'submit',
					sessionId,
					answers,
					timeSpent: {},
				}),
			});
			if (!res.success) { submitError = res.error || 'Submission failed'; submitting = false; return; }
			resultData = res.data;
			submitted = true;
			if (timerInterval) clearInterval(timerInterval);
		} catch { submitError = 'Network error'; submitting = false; }
	}

	function getOptionLabel(idx: number): string {
		return String.fromCharCode(65 + idx);
	}

	// Get subtest for current question
	function getCurrentSubtest(idx: number): string {
		if (idx < 60) return 'TPS';
		if (idx < 90) return 'Literasi Bahasa';
		return 'Matematika';
	}

	// Score display helpers
	function scoreColor(sc: number): string {
		if (sc >= 80) return 'var(--success)';
		if (sc >= 60) return 'var(--warning)';
		return 'var(--danger)';
	}
</script>

<svelte:head>
	<title>SBMPTN Mock Try Out — RPL AI Curriculum</title>
</svelte:head>

<div class="tryout-page">
	{#if loading && !started}
		<div class="loading-state">
			<div class="skeleton skeleton-title" style="width:300px;margin:0 auto"></div>
			<div class="skeleton skeleton-desc" style="width:200px;margin:12px auto"></div>
		</div>
	{:else if error && !started}
		<div class="error-state">
			<p>{error}</p>
			<button class="btn btn-primary" onclick={loadInitial}>Retry</button>
		</div>

	{:else if submitted && resultData}
		<!-- ═══ Result Screen ═══ -->
		<div class="result-screen animate-in">
			<div class="result-header">
				<h1>SBMPTN Mock Try Out</h1>
				<p class="result-subtitle">{offering?.name || ''}</p>
			</div>

			<div class="result-overview">
				<div class="score-hero" style="--score-clr: {scoreColor(resultData.scores.total)}">
					<div class="score-circle">
						<span class="score-value">{resultData.scores.total}</span>
						<span class="score-label">Total Score</span>
					</div>
				</div>

				<div class="score-breakdown">
					<div class="breakdown-item">
						<span class="breakdown-label">TPS</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill tps" style="width:{resultData.scores.tps}%"></div>
						</div>
						<span class="breakdown-value">{resultData.scores.tps}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Literasi</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill literasi" style="width:{resultData.scores.literasi}%"></div>
						</div>
						<span class="breakdown-value">{resultData.scores.literasi}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Matematika</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill matematika" style="width:{resultData.scores.matematika}%"></div>
						</div>
						<span class="breakdown-value">{resultData.scores.matematika}</span>
					</div>
				</div>

				<div class="result-stats">
					<span>Answered: {resultData.answersCount}/{resultData.totalQuestions}</span>
					{#if resultData.timeExpired}
						<span class="time-expired-badge">⏰ Time expired</span>
					{/if}
				</div>
			</div>

			<!-- Answer Key -->
			<div class="answer-key">
				<h2>Answer Key</h2>
				<div class="subtest-sections">
					{#each SUBTESTS as section}
						{@const secQs = resultData.results.filter((r: any) => {
							const idx = resultData.results.indexOf(r);
							return idx >= section.start && idx < section.start + section.count;
						})}
						{#if secQs.length > 0}
							<div class="subtest-section">
								<h3 class="subtest-label">{section.label}</h3>
								<div class="results-list">
									{#each secQs as r, i}
										<div class="result-card" class:correct={r.correct} class:wrong={!r.correct}>
											<div class="r-num">{section.start + i + 1}</div>
											<div class="r-body">
												<p class="r-question">{r.question}</p>
												<div class="r-options">
													{#each r.options as opt}
														<span class="r-opt"
															class:selected={opt.label === r.userAnswer}
															class:correct-opt={opt.label === r.correctAnswer}
															class:wrong-opt={opt.label === r.userAnswer && opt.label !== r.correctAnswer}
														>{opt.label}. {opt.text}</span>
													{/each}
												</div>
												<div class="r-verdict">
													{#if r.userAnswer}
														<span class="r-your-ans">Your answer: <strong>{r.userAnswer}</strong></span>
													{:else}
														<span class="r-your-ans unanswered">Unanswered</span>
													{/if}
													<span class="r-correct-ans">Correct: <strong>{r.correctAnswer}</strong></span>
													<Badge variant={r.correct ? 'success' : 'danger'}>{r.correct ? '✓' : '✗'}</Badge>
												</div>
												{#if r.explanation}
													<p class="r-explanation">{r.explanation}</p>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<div class="result-actions">
				<Button variant="outline" onclick={() => goto(`/learn/${offeringId}`)}>Back to Course</Button>
				<Button variant="primary" onclick={() => { submitted = false; started = false; resultData = null; answers = {}; flaggedQuestions = new Set(); loadInitial(); }}>Try Again</Button>
			</div>
		</div>

	{:else if !started}
		<!-- ═══ Instructions Screen ═══ -->
		<div class="instructions-screen animate-in">
			<div class="instructions-card">
				<div class="instructions-icon">📝</div>
				<h1>SBMPTN Mock Try Out</h1>
				<p class="offering-name">{offering?.name || ''}</p>

				<div class="info-badge">
					<span>⏱️ 180 minutes</span>
					<span>📋 100 questions</span>
					<span>📊 3 subtests</span>
				</div>

				<div class="subtest-info">
					<h3>Subtest Breakdown</h3>
					<ul>
						<li><strong>TPS (Tes Potensi Skolastik)</strong> — 60 soal</li>
						<li><strong>Literasi Bahasa</strong> — 30 soal</li>
						<li><strong>Matematika</strong> — 10 soal</li>
					</ul>
				</div>

				<div class="rules">
					<h3>Instructions</h3>
					<ul>
						<li>Each question has 5 options (A, B, C, D, E)</li>
						<li>Select the best answer for each question</li>
						<li>You can flag questions for review</li>
						<li>Time limit: 180 minutes (3 hours)</li>
						<li>The test will auto-submit when time expires</li>
						<li>You can submit early if finished</li>
					</ul>
				</div>

				<div class="start-action">
					<Button variant="primary" size="lg" onclick={startTryOut} loading={loading}>
						Mulai Try Out
					</Button>
				</div>
			</div>
		</div>

	{:else}
		<!-- ═══ Active Try Out ═══ -->
		<div class="tryout-active animate-in">
			<!-- Header with timer -->
			<header class="tryout-header">
				<div class="header-left">
					<h2>SBMPTN Mock Try Out</h2>
					<span class="question-progress-text">Q{currentQuestionIndex + 1}/{questions.length}</span>
				</div>
				<div class="header-right">
					<div class="timer"
						class:timer-warning={secondsRemaining <= 300 && secondsRemaining > 60}
						class:timer-critical={secondsRemaining <= 60}
					>
						<span class="timer-icon">⏱️</span>
						<span class="timer-value">{formatTime(secondsRemaining)}</span>
					</div>
					<Button variant="primary" onclick={handleConfirmSubmit} disabled={submitting}>
						{submitting ? 'Submitting...' : 'Submit'}
					</Button>
				</div>
			</header>

			<div class="tryout-body">
				<!-- Question Navigation Sidebar -->
				<aside class="question-sidebar">
					<div class="sidebar-stats">
						<div class="stat">
							<span class="stat-num">{answeredCount()}</span>
							<span class="stat-lbl">Answered</span>
						</div>
						<div class="stat">
							<span class="stat-num">{flaggedCount()}</span>
							<span class="stat-lbl">Flagged</span>
						</div>
						<div class="stat">
							<span class="stat-num">{questions.length - answeredCount()}</span>
							<span class="stat-lbl">Remaining</span>
						</div>
					</div>

					<!-- Subtest sections -->
					{#each SUBTESTS as section}
						<div class="sidebar-section">
							<div class="section-label">{section.label}</div>
							<div class="section-questions">
								{#each questions.slice(section.start, section.start + section.count) as q, i}
									{@const idx = section.start + i}
									<button
										class="q-btn"
										class:active={idx === currentQuestionIndex}
										class:answered={answers[q.id]?.trim() !== ''}
										class:flagged={flaggedQuestions.has(q.id)}
										onclick={() => goToQuestion(idx)}
									>{idx + 1}</button>
								{/each}
							</div>
						</div>
					{/each}
				</aside>

				<!-- Main Question Display -->
				<main class="question-display">
					{#if submitError}
						<div class="error-banner">⚠️ {submitError}</div>
					{/if}

					{#if currentQuestion}
						<div class="q-header">
							<Badge variant="primary">{getCurrentSubtest(currentQuestionIndex)}</Badge>
							<span class="q-difficulty q-diff-{currentQuestion.difficulty || 'medium'}">
								{currentQuestion.difficulty || 'medium'}
							</span>
							<button class="flag-btn" class:flagged={flaggedQuestions.has(currentQuestion.id)}
								onclick={() => toggleFlag(currentQuestion.id)}>
								{flaggedQuestions.has(currentQuestion.id) ? '🚩' : '🏳️'}
							</button>
						</div>

						<div class="q-content">
							<p class="q-text">{currentQuestion.question}</p>

							<div class="options-list">
								{#each currentQuestion.options as opt}
									<button
										class="option-btn"
										class:selected={answers[currentQuestion.id] === opt.label}
										onclick={() => selectAnswer(opt.label)}
									>
										<span class="opt-letter">{opt.label}</span>
										<span class="opt-text">{opt.text}</span>
										{#if answers[currentQuestion.id] === opt.label}
											<span class="opt-check">✓</span>
										{/if}
									</button>
								{/each}
							</div>
						</div>

						<div class="q-nav-buttons">
							<Button variant="outline" onclick={prevQuestion} disabled={currentQuestionIndex === 0}>
								← Sebelumnya
							</Button>
							{#if currentQuestionIndex < questions.length - 1}
								<Button variant="primary" onclick={nextQuestion}>
									Selanjutnya →
								</Button>
							{:else}
								<Button variant="primary" onclick={handleConfirmSubmit} disabled={submitting}>
									{submitting ? 'Submitting...' : 'Submit'}
								</Button>
							{/if}
						</div>
					{/if}
				</main>
			</div>
		</div>
	{/if}
</div>

<!-- Submit Confirmation Modal -->
{#if confirmSubmit}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => confirmSubmit = false} role="button" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="0">
			<h3>Submit Try Out?</h3>
			<div class="modal-stats">
				<p>Answered: <strong>{answeredCount()} / {questions.length}</strong></p>
				<p>Flagged: <strong>{flaggedCount()}</strong></p>
				{#if answeredCount() < questions.length}
					<p class="modal-warning">⚠️ You still have unanswered questions.</p>
				{/if}
				{#if timeExpired}
					<p class="modal-warning">⏰ Time has expired.</p>
				{/if}
			</div>
			<div class="modal-actions">
				<Button variant="outline" onclick={() => confirmSubmit = false}>Continue Reviewing</Button>
				<Button variant="primary" onclick={handleSubmit} loading={submitting}>Submit</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.tryout-page {
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
	}

	.loading-state, .error-state {
		padding: 80px 20px;
		text-align: center;
	}
	.error-state p { color: var(--danger); margin-bottom: 16px; }

	/* ── Instructions Screen ── */
	.instructions-screen {
		max-width: 640px;
		margin: 0 auto;
		padding: 48px 16px;
	}
	.instructions-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 32px;
	}
	.instructions-icon { font-size: 48px; text-align: center; margin-bottom: 12px; }
	.instructions-card h1 { font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 4px; }
	.offering-name { text-align: center; color: var(--text-secondary); font-size: 14px; margin-bottom: 20px; }

	.info-badge {
		display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;
		margin-bottom: 24px;
	}
	.info-badge span {
		padding: 6px 14px; background: var(--accent-dim); border-radius: 20px;
		font-size: 13px; font-weight: 600; color: var(--accent);
	}

	.subtest-info, .rules {
		margin-bottom: 20px;
	}
	.subtest-info h3, .rules h3 {
		font-size: 15px; font-weight: 600; margin-bottom: 8px; color: var(--text);
	}
	.subtest-info ul, .rules ul {
		padding-left: 20px; font-size: 14px; color: var(--text-secondary); line-height: 1.8;
	}
	.start-action { text-align: center; margin-top: 24px; }

	/* ── Active Try Out ── */
	.tryout-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 12px 20px; background: var(--surface);
		border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 20;
	}
	.header-left { display: flex; align-items: center; gap: 12px; }
	.header-left h2 { font-size: 16px; font-weight: 600; }
	.question-progress-text { font-size: 13px; color: var(--text-secondary); }
	.header-right { display: flex; align-items: center; gap: 12px; }

	.timer {
		display: flex; align-items: center; gap: 6px;
		padding: 6px 14px; border-radius: 8px;
		font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums;
		background: var(--bg); border: 1px solid var(--border);
	}
	.timer-warning { border-color: var(--warning); color: var(--warning); background: rgba(245,158,11,0.1); }
	.timer-critical { border-color: var(--danger); color: var(--danger); background: rgba(239,68,68,0.1); animation: pulse 1s infinite; }
	.timer-icon { font-size: 16px; }

	.tryout-body {
		display: flex; gap: 0; max-width: 1200px; margin: 0 auto;
	}

	/* Sidebar */
	.question-sidebar {
		width: 240px; min-width: 240px; padding: 16px;
		position: sticky; top: 60px; align-self: flex-start; max-height: calc(100vh - 60px);
		overflow-y: auto; border-right: 1px solid var(--border);
	}
	.sidebar-stats {
		display: flex; gap: 8px; margin-bottom: 16px; padding-bottom: 12px;
		border-bottom: 1px solid var(--border);
	}
	.stat { flex: 1; text-align: center; }
	.stat-num { display: block; font-size: 18px; font-weight: 700; }
	.stat-lbl { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

	.sidebar-section { margin-bottom: 16px; }
	.section-label {
		font-size: 11px; font-weight: 600; color: var(--accent); text-transform: uppercase;
		letter-spacing: 0.5px; margin-bottom: 6px;
	}
	.section-questions { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }

	.q-btn {
		width: 100%; aspect-ratio: 1; border: 1px solid var(--border); border-radius: 4px;
		background: var(--bg); color: var(--text-secondary); font-size: 11px; font-weight: 600;
		cursor: pointer; transition: all 0.12s;
	}
	.q-btn:hover { border-color: var(--accent); }
	.q-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
	.q-btn.answered { background: rgba(16,185,129,0.1); border-color: var(--success); color: var(--success); }
	.q-btn.flagged { background: rgba(245,158,11,0.1); border-color: var(--warning); color: var(--warning); }
	.q-btn.answered.active { background: rgba(16,185,129,0.2); }
	.q-btn.flagged.active { background: rgba(245,158,11,0.2); }

	/* Main question area */
	.question-display {
		flex: 1; padding: 24px; min-height: calc(100vh - 60px);
	}
	.error-banner {
		padding: 10px 16px; background: rgba(239,68,68,0.1); border: 1px solid var(--danger);
		border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: var(--danger);
	}

	.q-header {
		display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
	}
	.q-difficulty { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
	.q-diff-easy { color: var(--success); }
	.q-diff-medium { color: var(--warning); }
	.q-diff-hard { color: var(--danger); }
	.flag-btn {
		margin-left: auto; background: none; border: 1px solid var(--border);
		border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 14px;
		transition: all 0.12s;
	}
	.flag-btn.flagged { border-color: var(--warning); background: rgba(245,158,11,0.1); }

	.q-text {
		font-size: 16px; line-height: 1.6; margin-bottom: 24px;
		color: var(--text);
	}

	.options-list { display: flex; flex-direction: column; gap: 10px; }
	.option-btn {
		display: flex; align-items: center; gap: 12px; width: 100%;
		padding: 14px 18px; background: var(--surface); border: 1px solid var(--border);
		border-radius: 10px; cursor: pointer; text-align: left; font-size: 15px;
		color: var(--text); transition: all 0.12s;
	}
	.option-btn:hover { border-color: var(--accent); background: var(--surface-hover); }
	.option-btn.selected { border-color: var(--accent); background: var(--accent-dim); }
	.opt-letter {
		display: inline-flex; align-items: center; justify-content: center;
		width: 32px; height: 32px; border-radius: 8px;
		background: rgba(255,255,255,0.06); font-size: 14px; font-weight: 700;
		flex-shrink: 0;
	}
	.option-btn.selected .opt-letter { background: var(--accent); color: #fff; }
	.opt-text { flex: 1; }
	.opt-check { color: var(--accent); font-weight: 700; flex-shrink: 0; }

	.q-nav-buttons {
		display: flex; justify-content: space-between; margin-top: 32px;
		padding-top: 20px; border-top: 1px solid var(--border);
	}

	/* ── Result Screen ── */
	.result-screen {
		max-width: 800px; margin: 0 auto; padding: 32px 16px 64px;
	}
	.result-header { text-align: center; margin-bottom: 32px; }
	.result-header h1 { font-size: 26px; font-weight: 700; }
	.result-subtitle { color: var(--text-secondary); font-size: 14px; }

	.result-overview { text-align: center; margin-bottom: 32px; }

	.score-hero { margin-bottom: 24px; }
	.score-circle {
		display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
		width: 140px; height: 140px; border-radius: 50%;
		border: 4px solid var(--score-clr, var(--accent));
		background: rgba(255,255,255,0.02);
	}
	.score-value { font-size: 40px; font-weight: 800; color: var(--score-clr, var(--accent)); }
	.score-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }

	.score-breakdown {
		max-width: 400px; margin: 0 auto 20px;
		display: flex; flex-direction: column; gap: 10px;
	}
	.breakdown-item {
		display: flex; align-items: center; gap: 12px;
	}
	.breakdown-label { width: 90px; font-size: 13px; font-weight: 600; text-align: right; }
	.breakdown-bar-track {
		flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;
	}
	.breakdown-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
	.breakdown-bar-fill.tps { background: var(--accent); }
	.breakdown-bar-fill.literasi { background: var(--success); }
	.breakdown-bar-fill.matematika { background: var(--warning); }
	.breakdown-value { width: 36px; text-align: right; font-size: 14px; font-weight: 700; }

	.result-stats { color: var(--text-secondary); font-size: 14px; }
	.time-expired-badge { display: inline-block; margin-left: 12px; padding: 2px 10px; border-radius: 12px; background: rgba(239,68,68,0.1); color: var(--danger); font-size: 12px; }

	/* Answer Key */
	.answer-key { margin-bottom: 32px; }
	.answer-key h2 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
	.subtest-section { margin-bottom: 24px; }
	.subtest-label { font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

	.results-list { display: flex; flex-direction: column; gap: 8px; }
	.result-card {
		display: flex; gap: 12px; padding: 14px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
	}
	.result-card.correct { border-left: 3px solid var(--success); }
	.result-card.wrong { border-left: 3px solid var(--danger); }

	.r-num {
		font-size: 13px; font-weight: 700; color: var(--text-secondary); width: 24px; flex-shrink: 0; padding-top: 2px;
	}
	.r-body { flex: 1; min-width: 0; }
	.r-question { font-size: 14px; font-weight: 500; margin-bottom: 8px; line-height: 1.5; }

	.r-options { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
	.r-opt {
		font-size: 12px; padding: 3px 10px; border-radius: 4px;
		background: var(--bg); border: 1px solid var(--border);
	}
	.r-opt.selected { border-color: var(--accent); }
	.r-opt.correct-opt { background: rgba(16,185,129,0.1); border-color: var(--success); color: var(--success); }
	.r-opt.wrong-opt { background: rgba(239,68,68,0.1); border-color: var(--danger); color: var(--danger); }

	.r-verdict {
		display: flex; align-items: center; gap: 12px; font-size: 13px;
	}
	.r-your-ans { color: var(--text-secondary); }
	.r-your-ans.unanswered { font-style: italic; color: var(--text-quaternary); }
	.r-correct-ans { color: var(--success); }
	.r-explanation {
		margin-top: 6px; font-size: 13px; color: var(--text-tertiary);
		font-style: italic; line-height: 1.4;
	}

	.result-actions {
		display: flex; justify-content: center; gap: 12px; margin-top: 32px;
	}

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6);
		display: flex; align-items: center; justify-content: center;
		z-index: 100; animation: fadeIn 0.15s ease both;
	}
	.modal {
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
		padding: 28px; width: 400px; max-width: 90vw; box-shadow: var(--shadow-dialog);
	}
	.modal h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
	.modal-stats p { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; }
	.modal-warning { color: var(--warning) !important; font-weight: 600; margin-top: 8px !important; }
	.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

	/* Animations */
	@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

	/* Responsive */
	@media (max-width: 768px) {
		.tryout-body { flex-direction: column; }
		.question-sidebar {
			width: 100%; min-width: 0; position: static; max-height: none;
			border-right: none; border-bottom: 1px solid var(--border);
		}
		.section-questions { grid-template-columns: repeat(10, 1fr); }
		.question-display { padding: 16px; }
		.tryout-header { flex-direction: column; gap: 8px; padding: 10px 16px; }
		.header-left h2 { font-size: 14px; }
		.timer { font-size: 16px; }
		.score-circle { width: 100px; height: 100px; }
		.score-value { font-size: 30px; }
	}
</style>

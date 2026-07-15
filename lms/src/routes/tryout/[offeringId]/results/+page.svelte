<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button, Badge } from '$lib/components/ui';

	let { data }: { data: any } = $props();

	let offering = $derived(data.offering);
	let session = $derived(data.session);
	let scores = $derived(data.scores);
	let results = $derived(data.results || []);
	let answersCount = $derived(data.answersCount || 0);
	let totalQuestions = $derived(data.totalQuestions || 0);
	let offeringId = $derived($page.params.offeringId);

	const SUBTESTS = [
		{ key: 'tps', label: 'TPS', start: 0, count: 60 },
		{ key: 'literasi', label: 'Literasi Bahasa', start: 60, count: 30 },
		{ key: 'matematika', label: 'Matematika', start: 90, count: 10 },
	];

	function scoreColor(sc: number): string {
		if (sc >= 80) return 'var(--success)';
		if (sc >= 60) return 'var(--warning)';
		return 'var(--danger)';
	}
</script>

<svelte:head>
	<title>Try Out Results — SBMPTN Mock Try Out</title>
</svelte:head>

<div class="results-page">
	{#if !session}
		<div class="empty-state animate-in">
			<div class="empty-state-icon">📋</div>
			<h2 class="empty-state-title">No Completed Try Out</h2>
			<p class="empty-state-description">You haven't completed any SBMPTN Mock Try Out sessions yet.</p>
			<Button variant="primary" onclick={() => goto(`/tryout/${offeringId}`)}>Start Try Out</Button>
		</div>
	{:else}
		<div class="results-content animate-in">
			<div class="results-header">
				<h1>SBMPTN Mock Try Out — Results</h1>
				<p class="offering-name">{offering?.course_title || offering?.name || ''}</p>
				<p class="session-meta">
					Started: {new Date(session.started_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
					{session.submitted_at ? `· Submitted: ${new Date(session.submitted_at).toLocaleTimeString('id-ID', { timeStyle: 'short' })}` : ''}
				</p>
			</div>

			<!-- Score Overview -->
			<div class="score-overview">
				<div class="score-hero" style="--score-clr: {scoreColor(scores.total)}">
					<div class="score-circle">
						<span class="score-value">{scores.total}</span>
						<span class="score-label">Total Score</span>
					</div>
				</div>

				<div class="score-breakdown">
					<div class="breakdown-item">
						<span class="breakdown-label">TPS</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill tps" style="width:{scores.tps}%"></div>
						</div>
						<span class="breakdown-value">{scores.tps}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Literasi</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill literasi" style="width:{scores.literasi}%"></div>
						</div>
						<span class="breakdown-value">{scores.literasi}</span>
					</div>
					<div class="breakdown-item">
						<span class="breakdown-label">Matematika</span>
						<div class="breakdown-bar-track">
							<div class="breakdown-bar-fill matematika" style="width:{scores.matematika}%"></div>
						</div>
						<span class="breakdown-value">{scores.matematika}</span>
					</div>
				</div>

				<div class="result-stats">
					Answered: <strong>{answersCount}</strong> / {totalQuestions}
					· Status: <Badge variant={session.status === 'expired' ? 'warning' : 'success'}>
						{session.status === 'expired' ? 'Time Expired' : 'Submitted'}
					</Badge>
				</div>
			</div>

			<!-- Answer Key -->
			<div class="answer-key">
				<h2>Answer Key & Review</h2>

				<div class="summary-stats">
					<span class="stat-correct">✓ {results.filter((r: any) => r.correct).length} Correct</span>
					<span class="stat-wrong">✗ {results.filter((r: any) => !r.correct && r.userAnswer).length} Wrong</span>
					<span class="stat-unanswered">— {results.filter((r: any) => !r.userAnswer).length} Unanswered</span>
				</div>

				{#each SUBTESTS as section}
					{@const secQs = results.slice(section.start, section.start + section.count)}
					{#if secQs.length > 0}
						<div class="subtest-section">
							<h3 class="subtest-label">{section.label} ({secQs.filter((r: any) => r.correct).length}/{secQs.length})</h3>
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

			<div class="results-actions">
				<Button variant="outline" onclick={() => goto(`/learn/${offeringId}`)}>Back to Course</Button>
				<Button variant="primary" onclick={() => goto(`/tryout/${offeringId}`)}>Take Another Try Out</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.results-page {
		max-width: 800px; margin: 0 auto; padding: 32px 16px 64px;
		min-height: 100vh; background: var(--bg); color: var(--text);
	}

	.results-header { text-align: center; margin-bottom: 32px; }
	.results-header h1 { font-size: 24px; font-weight: 700; }
	.offering-name { color: var(--text-secondary); font-size: 14px; margin: 4px 0; }
	.session-meta { font-size: 12px; color: var(--text-tertiary); }

	.score-overview { text-align: center; margin-bottom: 32px; }

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
	.breakdown-item { display: flex; align-items: center; gap: 12px; }
	.breakdown-label { width: 90px; font-size: 13px; font-weight: 600; text-align: right; }
	.breakdown-bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
	.breakdown-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
	.breakdown-bar-fill.tps { background: var(--accent); }
	.breakdown-bar-fill.literasi { background: var(--success); }
	.breakdown-bar-fill.matematika { background: var(--warning); }
	.breakdown-value { width: 36px; text-align: right; font-size: 14px; font-weight: 700; }

	.result-stats { font-size: 14px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 8px; }

	.answer-key { margin-bottom: 32px; }
	.answer-key h2 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }

	.summary-stats { display: flex; gap: 16px; margin-bottom: 20px; font-size: 14px; }
	.stat-correct { color: var(--success); font-weight: 600; }
	.stat-wrong { color: var(--danger); font-weight: 600; }
	.stat-unanswered { color: var(--text-tertiary); }

	.subtest-section { margin-bottom: 24px; }
	.subtest-label { font-size: 14px; font-weight: 600; color: var(--accent); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }

	.results-list { display: flex; flex-direction: column; gap: 8px; }
	.result-card {
		display: flex; gap: 12px; padding: 14px; border-radius: 8px;
		border: 1px solid var(--border); background: var(--surface);
	}
	.result-card.correct { border-left: 3px solid var(--success); }
	.result-card.wrong { border-left: 3px solid var(--danger); }

	.r-num { font-size: 13px; font-weight: 700; color: var(--text-secondary); width: 24px; flex-shrink: 0; padding-top: 2px; }
	.r-body { flex: 1; min-width: 0; }
	.r-question { font-size: 14px; font-weight: 500; margin-bottom: 8px; line-height: 1.5; }

	.r-options { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
	.r-opt { font-size: 12px; padding: 3px 10px; border-radius: 4px; background: var(--bg); border: 1px solid var(--border); }
	.r-opt.selected { border-color: var(--accent); }
	.r-opt.correct-opt { background: rgba(16,185,129,0.1); border-color: var(--success); color: var(--success); }
	.r-opt.wrong-opt { background: rgba(239,68,68,0.1); border-color: var(--danger); color: var(--danger); }

	.r-verdict { display: flex; align-items: center; gap: 12px; font-size: 13px; flex-wrap: wrap; }
	.r-your-ans { color: var(--text-secondary); }
	.r-your-ans.unanswered { font-style: italic; color: var(--text-quaternary); }
	.r-correct-ans { color: var(--success); }
	.r-explanation { margin-top: 6px; font-size: 13px; color: var(--text-tertiary); font-style: italic; line-height: 1.4; }

	.results-actions { display: flex; justify-content: center; gap: 12px; margin-top: 32px; }

	@media (max-width: 640px) {
		.results-page { padding: 20px 12px 48px; }
		.score-circle { width: 100px; height: 100px; }
		.score-value { font-size: 30px; }
		.result-card { flex-direction: column; gap: 6px; }
		.r-num { width: auto; }
		.results-actions { flex-direction: column; }
	}
</style>

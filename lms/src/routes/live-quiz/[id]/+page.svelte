<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { Button, Card, Badge, Skeleton } from '$lib/components/ui/index.js';
	import { addToast } from '$lib/stores/toast.svelte';

	const quizId = $derived($page.params.id);

	let quizState = $state<any>(null);
	let loading = $state(true);
	let timeLeft = $state(0);
	let selectedAnswer = $state<string>('');
	let submitting = $state(false);
	let answered = $state(false);
	let lastResult = $state<{ correct: boolean; points: number } | null>(null);
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	async function loadState() {
		const res = await fetch(`/api/my/live-quiz/${quizId}/state`);
		const json = await res.json();
		if (!json.success) {
			// not a participant → redirect to join
			if (json.error?.includes('participant')) {
				window.location.href = '/live-quiz/join';
				return;
			}
			return;
		}
		quizState = json;
		timeLeft = json.quiz?.time_left ?? 0;
		loading = false;

		// reset per-question answer state
		if (json.my_answer) {
			answered = true;
			lastResult = { correct: !!json.my_answer.is_correct, points: 0 };
		} else {
			answered = false;
			lastResult = null;
			selectedAnswer = '';
		}
	}

	onMount(() => {
		loadState();
		pollTimer = setInterval(() => {
			if (!browser) return;
			if (!answered) {
				loadState();
			}
			// always refresh leaderboard + question switch detection
			const prevQ = quizState?.quiz?.current_index;
			if (prevQ !== undefined) {
				fetch(`/api/my/live-quiz/${quizId}/state`)
					.then((r) => r.json())
					.then((j) => {
						if (j.success) {
							const switched = j.quiz?.current_index !== prevQ;
							quizState = j;
							timeLeft = j.quiz?.time_left ?? 0;
							if (switched) {
								answered = false;
								lastResult = null;
								selectedAnswer = '';
							}
							if (j.my_answer && !answered) {
								answered = true;
								lastResult = { correct: !!j.my_answer.is_correct, points: 0 };
							}
						}
					});
			}
		}, 2500);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function submit() {
		if (!selectedAnswer || submitting) return;
		submitting = true;
		try {
			const res = await fetch(`/api/my/live-quiz/${quizId}/answer`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question_index: quizState.quiz.current_index,
					answer: selectedAnswer,
					response_time_ms: 0,
				}),
			});
			const json = await res.json();
			if (json.success) {
				answered = true;
				lastResult = { correct: !!json.is_correct, points: json.points };
			} else {
				addToast(json.error || 'Gagal mengirim jawaban', 'error');
			}
		} catch {
			addToast('Gagal mengirim jawaban', 'error');
		} finally {
			submitting = false;
		}
	}

	function showOption(o: any) {
		return typeof o === 'object' ? (o.text ?? o.value ?? o) : o;
	}
</script>

<svelte:head><title>Live Quiz</title></svelte:head>

<div class="page">
	{#if loading}
		<Skeleton />
	{:else if !quizState}
		<Card><div class="msg"><p>Gagal memuat kuis. Kembali ke <a href="/live-quiz/join">join page</a>.</p></div></Card>
	{:else}
		<div class="topbar">
			<h1>{quizState.quiz.title}</h1>
			<div class="score-box">
				<span class="score">{quizState.my_score ?? 0} pts</span>
				<span class="answered">{quizState.my_answered ?? 0} soal</span>
			</div>
		</div>

		{#if quizState.quiz.status === 'lobby'}
			<Card>
				<div class="waiting">
					<div class="spinner"></div>
					<h2>Menunggu guru memulai…</h2>
					<p class="muted">Siapkan dirimu. Kuis akan dimulai otomatis.</p>
				</div>
			</Card>
		{:else if quizState.quiz.status === 'running'}
			{#if quizState.question}
				<Card>
					<div class="question-box">
						<div class="q-head">
							<Badge variant="primary">Soal {quizState.quiz.current_index + 1} / {quizState.quiz.question_count}</Badge>
							<Badge variant={timeLeft <= 5 ? 'danger' : 'outline'}>⏱ {timeLeft}s</Badge>
							<span class="pts">{quizState.question.points || 1} pts</span>
						</div>
						<h2 class="q-text">{quizState.question.question}</h2>

						{#if answered && lastResult}
							<div class="result" class:correct={lastResult.correct} class:wrong={!lastResult.correct}>
								<span class="result-icon">{lastResult.correct ? '✅' : '❌'}</span>
								<div>
									<strong>{lastResult.correct ? 'Benar!' : 'Salah'}</strong>
									{#if lastResult.correct}<span class="muted">+{lastResult.points} pts</span>{/if}
								</div>
							</div>
						{:else}
							<div class="options">
								{#each quizState.question.options || [] as opt, i}
									<button
										class="opt"
										class:selected={selectedAnswer === String(i)}
										onclick={() => (selectedAnswer = String(i))}
									>
										<span class="opt-key">{String.fromCharCode(65 + i)}</span>
										<span>{showOption(opt)}</span>
									</button>
								{/each}
							</div>
							<Button onclick={submit} disabled={!selectedAnswer || submitting} class="submit-btn">
								{submitting ? 'Mengirim…' : 'Kirim Jawaban'}
							</Button>
						{/if}
					</div>
				</Card>
			{:else}
				<Card><div class="msg"><p>Memuat soal…</p></div></Card>
			{/if}
		{:else}
			<Card>
				<div class="finished">
					<div class="big">🏆</div>
					<h2>Kuis Selesai!</h2>
					<p class="score-final">Skor kamu: <strong>{quizState.my_score ?? 0}</strong> pts</p>
					<p class="muted">{quizState.my_answered ?? 0} soal terjawab</p>
					<a href="/"><Button>Kembali ke Beranda</Button></a>
				</div>
			</Card>
		{/if}

		{#if (quizState.leaderboard || []).length > 0 && quizState.quiz.status !== 'lobby'}
			<Card>
				<div class="lb">
					<h3>🏆 Papan Skor Live</h3>
					<ol>
						{#each quizState.leaderboard as p, i}
							<li class:me={p.user_id === $page.data?.user?.id} class:top3={i < 3}>
								<span class="rank">{i + 1}</span>
								<span class="name">{p.name || p.user_id.slice(0, 8)}</span>
								<span class="score">{p.score}</span>
							</li>
						{/each}
					</ol>
				</div>
			</Card>
		{/if}
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 16px; max-width: 720px; margin: 0 auto; padding: 20px; }
	.topbar { display: flex; justify-content: space-between; align-items: center; }
	.topbar h1 { margin: 0; font-size: 20px; }
	.score-box { display: flex; flex-direction: column; align-items: flex-end; font-size: 13px; color: var(--text-secondary); }
	.score { font-size: 20px; font-weight: 800; color: #4f46e5; }
	.waiting { text-align: center; padding: 48px 16px; }
	.spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: #4f46e5; border-radius: 50%; margin: 0 auto 14px; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.muted { color: var(--text-muted); font-size: 13px; }
	.question-box { padding: 20px; }
	.q-head { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
	.pts { font-size: 13px; color: var(--text-muted); margin-left: auto; }
	.q-text { font-size: 19px; margin: 0 0 18px; line-height: 1.45; }
	.options { display: flex; flex-direction: column; gap: 10px; }
	.opt { display: flex; align-items: center; gap: 12px; padding: 13px 14px; border: 2px solid var(--border); border-radius: 12px; background: var(--surface, #fff); cursor: pointer; font-size: 15px; text-align: left; transition: border-color 0.15s, background 0.15s; }
	.opt:hover { border-color: #a5b4fc; }
	.opt.selected { border-color: #4f46e5; background: #eef2ff; }
	.opt-key { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 13px; flex-shrink: 0; }
	.submit-btn { width: 100%; margin-top: 14px; }
	.result { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 12px; font-size: 15px; }
	.result.correct { background: #ecfdf5; color: #065f46; }
	.result.wrong { background: #fef2f2; color: #991b1b; }
	.result-icon { font-size: 28px; }
	.finished { text-align: center; padding: 40px 16px; }
	.big { font-size: 52px; }
	.score-final { font-size: 18px; }
	.score-final strong { font-size: 28px; color: #4f46e5; }
	.lb { padding: 16px; }
	.lb h3 { margin: 0 0 10px; font-size: 15px; }
	.lb ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
	.lb li { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px; font-size: 13px; }
	.lb li.top3 { background: #fefce8; }
	.lb li.me { outline: 2px solid #4f46e5; }
	.rank { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--border); font-weight: 700; font-size: 12px; flex-shrink: 0; }
	.name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.score { font-weight: 700; color: #4f46e5; }
	.msg { padding: 24px; text-align: center; color: var(--text-secondary); }
</style>

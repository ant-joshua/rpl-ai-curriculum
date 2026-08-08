<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { Button, Card, Badge, Skeleton, EmptyState } from '$lib/components/ui/index.js';
	import { addToast } from '$lib/stores/toast.svelte';

	const quizId = $derived($page.params.id);

	let quiz = $state<any>(null);
	let questions = $state<any[]>([]);
	let participants = $state<any[]>([]);
	let responses = $state<any[]>([]);
	let loading = $state(true);
	let busy = $state(false);
	let elapsed = $state(0);
	let pollTimer: ReturnType<typeof setInterval> | null = null;

	async function load() {
		const res = await fetch(`/api/instructor/live-quizzes/${quizId}`);
		const json = await res.json();
		if (!json.success) {
			addToast(json.error || 'Gagal load quiz', 'error');
			return;
		}
		quiz = json.quiz;
		questions = json.questions || [];
		participants = json.participants || [];
		responses = json.responses || [];
		loading = false;
	}

	function currentQuestion() {
		if (!quiz || quiz.current_index < 0) return null;
		return questions.find((q: any) => q.id === (quiz.question_ids[quiz.current_index])) || null;
	}

	function timeLimit() {
		const t = quiz?.question_times?.[quiz.current_index];
		return t || 30;
	}

	// countdown for host display
	onMount(() => {
		load();
		pollTimer = setInterval(async () => {
			if (!browser) return;
			await load();
			if (quiz?.status === 'running' && quiz?.question_started_at) {
				const start = new Date(quiz.question_started_at).getTime();
				elapsed = Math.floor((Date.now() - start) / 1000);
			}
		}, 2500);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function control(action: string) {
		busy = true;
		try {
			const res = await fetch(`/api/instructor/live-quizzes/${quizId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action }),
			});
			const json = await res.json();
			if (!json.success) {
				addToast(json.error || 'Gagal', 'error');
			} else {
				await load();
				elapsed = 0;
			}
		} catch {
			addToast('Gagal', 'error');
		} finally {
			busy = false;
		}
	}

	function answeredCount(qIndex: number) {
		return responses.filter((r: any) => r.question_index === qIndex).length;
	}

	function correctCount(qIndex: number) {
		return responses.filter((r: any) => r.question_index === qIndex && r.is_correct).length;
	}
</script>

<svelte:head><title>Host Live Quiz</title></svelte:head>

<div class="page">
	{#if loading}
		<Skeleton />
	{:else if !quiz}
		<EmptyState title="Quiz tidak ditemukan" description="Quiz mungkin sudah dihapus." />
	{:else}
		<div class="topbar">
			<div>
				<h1>{quiz.title}</h1>
				<p class="pin">PIN: <strong>{quiz.pin}</strong> · {quiz.status}</p>
			</div>
			<div class="actions">
				{#if quiz.status === 'lobby'}
					<Button onclick={() => control('start')} disabled={busy}>▶ Mulai Quiz</Button>
				{:else if quiz.status === 'running'}
					<Button onclick={() => control('next')} disabled={busy}>
						{quiz.current_index + 1 >= quiz.question_ids.length ? '🏁 Selesai' : 'Soal Berikutnya →'}
					</Button>
					<Button variant="danger" onclick={() => control('finish')} disabled={busy}>Akhiri</Button>
				{:else}
					<Badge variant="success">Quiz Selesai</Badge>
				{/if}
			</div>
		</div>

		<div class="grid">
			<div class="main-col">
				{#if quiz.status === 'lobby'}
					<Card>
						<div class="lobby">
							<h2>Siswa bergabung…</h2>
							<p class="muted">Tampilkan PIN ini di layar. Siswa buka <code>/live-quiz/join</code> dan masukkan PIN.</p>
							<div class="big-pin">{quiz.pin}</div>
							<p class="muted">{participants.length} peserta sudah join</p>
						</div>
					</Card>
				{:else if quiz.status === 'running' && currentQuestion()}
					{@const q = currentQuestion()}
					<Card>
						<div class="q-host">
							<div class="q-head">
								<Badge variant="primary">Soal {quiz.current_index + 1} / {quiz.question_ids.length}</Badge>
								<Badge variant={elapsed > timeLimit() ? 'danger' : 'outline'}>⏱ {Math.max(0, timeLimit() - elapsed)}s</Badge>
							</div>
							<h2 class="q-text">{q.question}</h2>
							<div class="options">
								{#each q.options || [] as opt, i}
									<div class="opt-row">
										<span class="opt-key">{String.fromCharCode(65 + i)}</span>
										<span>{typeof opt === 'object' ? (opt.text ?? opt.value ?? opt) : opt}</span>
									</div>
								{/each}
							</div>
							<div class="q-stats">
								<span>✅ {answeredCount(quiz.current_index)}/{participants.length} menjawab</span>
								<span>🎯 {correctCount(quiz.current_index)} benar</span>
							</div>
						</div>
					</Card>
				{:else if quiz.status === 'running'}
					<Card><div class="lobby"><p class="muted">Memuat soal…</p></div></Card>
				{:else}
					<Card>
						<div class="lobby">
							<h2>🎉 Quiz Selesai!</h2>
							<p class="muted">Total {participants.length} peserta · {quiz.question_ids.length} soal</p>
						</div>
					</Card>
				{/if}
			</div>

			<div class="side-col">
				<Card>
					<div class="leaderboard">
						<h3>🏆 Papan Skor</h3>
						{#if participants.length === 0}
							<p class="muted">Belum ada peserta.</p>
						{:else}
							<ol>
								{#each participants as p, i}
									<li class:top3={i < 3}>
										<span class="rank">{i + 1}</span>
										<span class="name">{p.name || p.email}</span>
										<span class="score">{p.score}</span>
									</li>
								{/each}
							</ol>
						{/if}
					</div>
				</Card>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 18px; }
	.topbar { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
	.topbar h1 { margin: 0; font-size: 22px; }
	.pin { margin: 4px 0 0; color: var(--text-secondary); font-size: 13px; }
	.pin strong { color: #4f46e5; font-size: 16px; }
	.actions { display: flex; gap: 8px; align-items: center; }
	.grid { display: grid; grid-template-columns: 1fr 320px; gap: 16px; align-items: start; }
	.main-col { display: flex; flex-direction: column; gap: 12px; }
	.side-col { display: flex; flex-direction: column; gap: 12px; }
	.lobby { text-align: center; padding: 30px 16px; }
	.big-pin { font-size: 64px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; margin: 16px 0; font-variant-numeric: tabular-nums; }
	.muted { color: var(--text-muted); font-size: 13px; }
	code { background: var(--surface-hover, #f1f2f4); padding: 2px 6px; border-radius: 5px; font-size: 13px; }
	.q-host { padding: 18px; }
	.q-head { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
	.q-text { font-size: 20px; margin: 0 0 16px; line-height: 1.4; }
	.options { display: flex; flex-direction: column; gap: 8px; }
	.opt-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; }
	.opt-key { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #eef2ff; color: #4f46e5; font-weight: 700; font-size: 13px; }
	.q-stats { display: flex; gap: 14px; margin-top: 14px; font-size: 13px; color: var(--text-secondary); }
	.leaderboard { padding: 14px; }
	.leaderboard h3 { margin: 0 0 10px; font-size: 15px; }
	.leaderboard ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
	.leaderboard li { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px; font-size: 13px; }
	.leaderboard li.top3 { background: #fefce8; }
	.rank { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--border); font-weight: 700; font-size: 12px; flex-shrink: 0; }
	.name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.score { font-weight: 700; color: #4f46e5; }
</style>

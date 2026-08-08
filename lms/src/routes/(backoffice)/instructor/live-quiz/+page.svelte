<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Button, Card, EmptyState, Select, Badge, Skeleton } from '$lib/components/ui/index.js';
	import { addToast } from '$lib/stores/toast.svelte';

	let offerings = $state<any[]>([]);
	let questions = $state<any[]>([]);
	let quizzes = $state<any[]>([]);
	let loading = $state(true);
	let creating = $state(false);

	let selectedOffering = $state('');
	let quizTitle = $state('');
	let selectedQs = $state<Record<string, boolean>>({});
	let questionTime = $state(30);
	let showCreate = $state(false);

	// Fetch offerings (mine), quizzes, and questions for selected offering
	async function loadOfferingQuestions() {
		if (!selectedOffering) return;
		const res = await fetch(`/api/instructor/courses?role=instructor`);
		// questions from question bank per offering
		const qres = await fetch(`/api/admin/question-bank?course_offering_id=${selectedOffering}`);
		const qjson = await qres.json();
		questions = qjson.questions || qjson.results || [];
	}

	onMount(async () => {
		// load my offerings
		const res = await fetch('/api/instructor/courses');
		const json = await res.json();
		offerings = json.courses || json.offerings || [];

		// load my quizzes
		const qres = await fetch('/api/instructor/live-quizzes');
		const qjson = await qres.json();
		quizzes = qjson.quizzes || [];

		loading = false;
	});

	function toggleQ(id: string) {
		selectedQs[id] = !selectedQs[id];
	}

	async function createQuiz() {
		const qids = Object.entries(selectedQs).filter(([, v]) => v).map(([k]) => k);
		if (!selectedOffering || !quizTitle.trim() || qids.length === 0) {
			addToast('Isi judul, pilih offering, dan centang minimal 1 soal', 'error');
			return;
		}
		creating = true;
		try {
			const res = await fetch('/api/instructor/live-quizzes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					course_offering_id: selectedOffering,
					title: quizTitle.trim(),
					question_ids: qids,
					question_times: qids.map(() => questionTime),
				}),
			});
			const json = await res.json();
			if (json.success && json.quiz) {
				addToast(`Quiz dibuat! PIN: ${json.quiz.pin}`);
				showCreate = false;
				selectedQs = {};
				quizTitle = '';
				// refresh list
				const qres = await fetch('/api/instructor/live-quizzes');
				const qjson = await qres.json();
				quizzes = qjson.quizzes || [];
				// open host page
				window.location.href = `/instructor/live-quiz/${json.quiz.id}`;
			} else {
				addToast(json.error || 'Gagal membuat quiz', 'error');
			}
		} catch {
			addToast('Gagal membuat quiz', 'error');
		} finally {
			creating = false;
		}
	}

	function statusLabel(s: string) {
		const map: Record<string, string> = { lobby: 'Lobby', running: 'Berjalan', finished: 'Selesai' };
		return map[s] || s;
	}
</script>

<svelte:head><title>Live Quiz — Guru</title></svelte:head>

<div class="page">
	<div class="page-head">
		<div>
			<h1>Live Quiz</h1>
			<p class="sub">Kuis interaktif real-time. Siswa join pakai PIN, jawab bareng, skor langsung tampil.</p>
		</div>
		<Button onclick={() => (showCreate = true)}>+ Buat Quiz</Button>
	</div>

	{#if showCreate}
		<Card>
			<div class="create-form">
				<h3>Buat Live Quiz</h3>
				<label class="field">
					<span>Kelas / Offering</span>
					<Select
						options={offerings.map((o) => ({ value: o.id, label: o.name || o.code || o.id }))}
						value={selectedOffering}
						onchange={(e: any) => {
							selectedOffering = e.target.value;
							loadOfferingQuestions();
						}}
					/>
				</label>
				<label class="field">
					<span>Judul Quiz</span>
					<input type="text" bind:value={quizTitle} placeholder="Contoh: Kuis Interaktif Bab 3" />
				</label>
				<label class="field">
					<span>Waktu per Soal (detik)</span>
					<input type="number" bind:value={questionTime} min="10" max="120" />
				</label>

				{#if selectedOffering}
					<div class="q-picker">
						<h4>Pilih Soal ({Object.values(selectedQs).filter(Boolean).length} dipilih)</h4>
						{#if questions.length === 0}
							<p class="muted">Belum ada soal di bank soal offering ini.</p>
						{:else}
							{#each questions as q}
								<label class="q-item">
									<input type="checkbox" checked={!!selectedQs[q.id]} onchange={() => toggleQ(q.id)} />
									<div>
										<strong>{q.question}</strong>
										<small>{q.type} · {q.points || 1} poin</small>
									</div>
								</label>
							{/each}
						{/if}
					</div>
				{:else}
					<p class="muted">Pilih offering dulu untuk lihat bank soal.</p>
				{/if}

				<div class="form-actions">
					<Button variant="secondary" onclick={() => (showCreate = false)}>Batal</Button>
					<Button onclick={createQuiz} disabled={creating}>{creating ? 'Membuat...' : 'Buat & Mulai'}</Button>
				</div>
			</div>
		</Card>
	{/if}

	<h2 class="section-title">Quiz Saya</h2>

	{#if loading}
		<Skeleton />
	{:else if quizzes.length === 0}
		<EmptyState title="Belum ada live quiz" description="Buat quiz pertama dari bank soal kelas-mu." />
	{:else}
		<div class="quiz-grid">
			{#each quizzes as q}
				<Card>
					<div class="quiz-card">
						<div class="quiz-top">
							<h3>{q.title}</h3>
							<Badge variant={q.status === 'running' ? 'success' : q.status === 'lobby' ? 'warning' : 'outline'}>
								{statusLabel(q.status)}
							</Badge>
						</div>
						<p class="pin">PIN: <strong>{q.pin}</strong></p>
						<p class="muted">{q.participant_count ?? 0} peserta · dibuat {new Date(q.created_at).toLocaleDateString('id-ID')}</p>
						<div class="quiz-actions">
							{#if q.status !== 'finished'}
								<a href={`/instructor/live-quiz/${q.id}`}>
									<Button>{q.status === 'lobby' ? 'Buka Host' : 'Lanjutkan'}</Button>
								</a>
							{:else}
								<a href={`/instructor/live-quiz/${q.id}`}>
									<Button variant="secondary">Lihat Hasil</Button>
								</a>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { display: flex; flex-direction: column; gap: 20px; }
	.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
	.page-head h1 { margin: 0; font-size: 22px; }
	.sub { margin: 4px 0 0; color: var(--text-secondary); font-size: 13px; }
	.section-title { font-size: 16px; margin: 8px 0 0; }
	.create-form { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
	.create-form h3 { margin: 0; font-size: 16px; }
	.field { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
	.field span { font-weight: 600; }
	.field input, .field :global(select) { padding: 8px 10px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; }
	.q-picker { border: 1px solid var(--border); border-radius: 10px; padding: 12px; max-height: 280px; overflow-y: auto; }
	.q-picker h4 { margin: 0 0 8px; font-size: 13px; }
	.q-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px; border-radius: 8px; cursor: pointer; }
	.q-item:hover { background: var(--surface-hover, #f6f7f9); }
	.q-item input { margin-top: 3px; }
	.q-item small { display: block; color: var(--text-muted); margin-top: 2px; }
	.q-item strong { font-size: 13px; font-weight: 500; }
	.muted { color: var(--text-muted); font-size: 13px; }
	.form-actions { display: flex; justify-content: flex-end; gap: 8px; }
	.quiz-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
	.quiz-card { padding: 16px; }
	.quiz-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
	.quiz-top h3 { margin: 0; font-size: 15px; }
	.pin { margin: 8px 0 4px; font-size: 20px; color: var(--text-primary); }
	.pin strong { font-size: 26px; letter-spacing: 2px; color: #4f46e5; }
	.quiz-actions { margin-top: 12px; }
</style>

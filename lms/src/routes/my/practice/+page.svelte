<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		Button, Badge, Select, Alert, Skeleton, EmptyState, Textarea
	} from '$lib/components/ui';
	import { fade } from 'svelte/transition';

	interface Question {
		id: string;
		course_offering_id: string;
		type: string;
		question: string;
		options: string | null;
		code_template: string | null;
		difficulty: string;
		points: number;
		tags: string | null;
	}

	interface Offering {
		id: string;
		name: string;
		code: string;
	}

	let questions = $state<Question[]>([]);
	let offerings = $state<Offering[]>([]);
	let loading = $state(true);
	let error = $state('');

	let filterOffering = $state('');
	let searchText = $state('');

	// Answers keyed by question id
	let answers = $state<Record<string, string>>({});
	// Feedback keyed by question id
	let feedback = $state<Record<string, { correct: boolean; explanation: string; correct_answer?: string }>>({});
	let checking = $state<Record<string, boolean>>({});
	let showAll = $state(false);

	const difficultyBadgeMap: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
		easy: 'success',
		medium: 'warning',
		hard: 'danger',
	};
	const typeLabelMap: Record<string, string> = {
		multiple_choice: 'PG',
		essay: 'Essay',
		coding: 'Coding',
	};

	$effect(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (filterOffering) params.set('course_offering_id', filterOffering);
			if (searchText) params.set('search', searchText);

			const [qRes, offRes] = await Promise.all([
				fetch(`/api/my/practice?${params}`),
				fetch(`/api/admin/course-offerings`),
			]);
			const qJson = await qRes.json();
			if (qJson.success) {
				questions = qJson.data || [];
				// Reset answers & feedback when questions change
				answers = {};
				feedback = {};
			} else {
				error = qJson.error || 'Gagal memuat soal';
			}
			const offJson = await offRes.json();
			if (offJson.success) {
				offerings = offJson.data || [];
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		loadData();
	}

	function parseOptions(raw: string | null): string[] {
		if (!raw) return [];
		try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
		catch { return []; }
	}

	async function checkAnswer(q: Question) {
		const answer = answers[q.id];
		if (!answer?.trim()) return;

		checking[q.id] = true;
		feedback[q.id] = undefined as any;

		try {
			const res = await fetch('/api/my/practice/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ question_id: q.id, answer }),
			});
			const json = await res.json();
			if (json.success) {
				feedback[q.id] = json.data;
			} else {
				feedback[q.id] = { correct: false, explanation: json.error || 'Gagal memeriksa' };
			}
		} catch {
			feedback[q.id] = { correct: false, explanation: 'Gagal terhubung ke server' };
		} finally {
			checking[q.id] = false;
		}
	}

	function capitalize(s: string) {
		return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
	}

	let offeringFilterOptions = $derived([
		{ value: '', label: 'Semua Kelas' },
		...offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` })),
	]);

	let answeredCount = $derived(Object.keys(feedback).length);
</script>

<svelte:head>
	<title>Latihan Soal — RPL AI Curriculum</title>
</svelte:head>

<div class="practice-page">
	<div class="page-header">
		<div>
			<h1>🧪 Latihan Soal</h1>
			<p class="page-desc">Berlatih soal dari bank soal. Periksa jawaban langsung.</p>
		</div>
	</div>

	{#if error}
		<Alert variant="danger">{error}</Alert>
	{/if}

	<!-- Filters -->
	<div class="filter-bar">
		<div class="filter-row">
			<Select options={offeringFilterOptions} bind:value={filterOffering} />
			<input
				type="text"
				class="search-input"
				placeholder="Cari soal..."
				bind:value={searchText}
				onkeydown={(e) => { if (e.key === 'Enter') applyFilters(); }}
			/>
			<Button onclick={applyFilters}>Cari</Button>
		</div>
		<span class="filter-count">{questions.length} soal tersedia {answeredCount > 0 ? `· ${answeredCount} terjawab` : ''}</span>
	</div>

	<!-- Questions -->
	{#if loading}
		<Skeleton variant="card" count={3} />
	{:else if questions.length === 0}
		<EmptyState
			title="Tidak Ada Soal"
			description="Belum ada soal yang dipublikasikan untuk kelas ini."
		/>
	{:else}
		<div class="questions-list">
			{#each questions as q (q.id)}
				<div class="question-card" class:answered={!!feedback[q.id]} in:fade={{ duration: 200, delay: 30 }}>
					<div class="q-header">
						<div class="q-badges">
							<Badge variant="info">{typeLabelMap[q.type] || capitalize(q.type)}</Badge>
							<Badge variant={difficultyBadgeMap[q.difficulty] || 'default'}>{capitalize(q.difficulty)}</Badge>
							{#if q.tags}
								{@const tagList = q.tags.split(',').filter(Boolean).map(t => t.trim())}
								{#each tagList as tag}
									<span class="tag">{tag}</span>
								{/each}
							{/if}
						</div>
						<span class="q-points">{q.points} poin</span>
					</div>

					<div class="q-question">
						<p>{q.question}</p>
					</div>

					<!-- Answer area -->
					<div class="q-answer">
						{#if q.type === 'multiple_choice'}
							{@const opts = parseOptions(q.options)}
							<div class="mc-options">
								{#each opts as opt, i}
									<label class="mc-option" class:selected={answers[q.id] === opt}>
										<input
											type="radio"
											name="q-{q.id}"
											value={opt}
											bind:group={answers[q.id]}
											disabled={!!feedback[q.id]}
										/>
										<span>{opt}</span>
									</label>
								{/each}
							</div>
						{:else if q.type === 'essay'}
							<Textarea
								placeholder="Tulis jawaban..."
								bind:value={answers[q.id]}
								rows={4}
								disabled={!!feedback[q.id]}
							/>
						{:else}
							<!-- coding -->
							{#if q.code_template}
								<pre class="code-block">{q.code_template}</pre>
							{/if}
							<Textarea
								placeholder="Tulis kode..."
								bind:value={answers[q.id]}
								rows={5}
								disabled={!!feedback[q.id]}
							/>
						{/if}
					</div>

					<!-- Actions -->
					<div class="q-actions">
						{#if !feedback[q.id]}
							<Button
								onclick={() => checkAnswer(q)}
								disabled={!answers[q.id]?.trim() || checking[q.id]}
								loading={checking[q.id]}
							>
								Periksa Jawaban
							</Button>
						{:else}
							<div class="q-feedback" class:correct={feedback[q.id].correct} class:incorrect={!feedback[q.id].correct}>
								<div class="feedback-header">
									<span class="feedback-result">
										{feedback[q.id].correct ? '✅ Benar!' : '❌ Salah'}
									</span>
									<span class="feedback-points">+{feedback[q.id].correct ? q.points : 0} poin</span>
								</div>
								<p class="feedback-explain">{feedback[q.id].explanation}</p>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Stats bar -->
	{#if answeredCount > 0}
		<div class="stats-bar">
			<span>Terjawab: {answeredCount}/{questions.length}</span>
			<span>Benar: {Object.values(feedback).filter(f => f.correct).length}</span>
			<Button variant="ghost" onclick={() => { answers = {}; feedback = {}; }}>Reset</Button>
		</div>
	{/if}
</div>

<style>
	.practice-page { max-width: 800px; }
	h1 {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 4px;
		color: var(--text);
	}
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header { margin-bottom: 24px; }

	.filter-bar { margin-bottom: 20px; }
	.filter-row {
		display: flex;
		gap: 10px;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.search-input {
		padding: 8px 12px;
		font-size: 13px;
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-family: inherit;
		min-width: 200px;
		flex: 1;
	}
	.search-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-dim);
	}
	.filter-count {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 8px;
		display: block;
	}

	.questions-list { display: flex; flex-direction: column; gap: 16px; }

	.question-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		transition: border-color 0.15s;
	}
	.question-card.answered {
		border-color: rgba(79,70,229,0.3);
	}

	.q-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}
	.q-badges {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.tag {
		font-size: 11px;
		background: var(--accent-dim);
		color: var(--accent);
		padding: 2px 8px;
		border-radius: 10px;
	}
	.q-points {
		font-size: 13px;
		font-weight: 510;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.q-question p {
		font-size: 15px;
		line-height: 1.6;
		margin: 0;
	}

	.q-answer { display: flex; flex-direction: column; gap: 8px; }

	.mc-options { display: flex; flex-direction: column; gap: 6px; }
	.mc-option {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.15s;
	}
	.mc-option:hover { border-color: var(--accent-dim); background: var(--accent-dim); }
	.mc-option.selected { border-color: var(--accent); background: var(--accent-dim); }
	.mc-option input { accent-color: var(--accent); }

	.code-block {
		background: rgba(0,0,0,0.3);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 13px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		overflow-x: auto;
		line-height: 1.5;
		margin: 0;
	}

	.q-actions { margin-top: 4px; }

	.q-feedback {
		padding: 14px;
		border-radius: 8px;
		border: 1px solid;
	}
	.q-feedback.correct {
		background: rgba(34,197,94,0.08);
		border-color: rgba(34,197,94,0.3);
	}
	.q-feedback.incorrect {
		background: rgba(239,68,68,0.08);
		border-color: rgba(239,68,68,0.3);
	}
	.feedback-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
	}
	.feedback-result {
		font-size: 15px;
		font-weight: 510;
	}
	.feedback-points {
		font-size: 13px;
		font-weight: 510;
		color: #22c55e;
	}
	.feedback-explain {
		font-size: 14px;
		margin: 0;
		opacity: 0.85;
		line-height: 1.5;
	}

	.stats-bar {
		position: sticky;
		bottom: 0;
		margin-top: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 20px;
		display: flex;
		align-items: center;
		gap: 16px;
		font-size: 13px;
		color: var(--text-secondary);
		z-index: 50;
		backdrop-filter: blur(8px);
	}
</style>

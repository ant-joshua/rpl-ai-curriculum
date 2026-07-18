<script lang="ts">
	import { t } from '$lib/stores/i18n.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	type Submission = {
		id: string;
		user_name: string;
		submitted_at: string;
		assessment_title?: string;
		assignment_title?: string;
		answers?: any;
		submission_text?: string;
		description?: string;
	};

	let submissions = $state<{ assessment_submissions: Submission[]; assignment_submissions: Submission[] }>({
		assessment_submissions: [],
		assignment_submissions: [],
	});
	let loading = $state(false);
	let grading = $state<string | null>(null);
	let gradeResult = $state<any>(null);
	let selectedSub = $state<Submission | null>(null);
	let error = $state('');

	function getAuthToken(): string | null {
		if (!browser) return null;
		return localStorage.getItem('lms-auth-token');
	}

	async function loadSubmissions() {
		loading = true;
		error = '';
		try {
			const token = getAuthToken();
			const res = await fetch('/api/ai/grade', {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});
			const json = await res.json();
			if (json.success) {
				submissions = json.data;
			} else {
				error = json.error || 'Gagal memuat data';
			}
		} catch (e) {
			error = 'Gagal memuat data penilaian';
		} finally {
			loading = false;
		}
	}

	async function gradeSubmission(subId: string) {
		grading = subId;
		gradeResult = null;
		error = '';
		try {
			const token = getAuthToken();
			const res = await fetch('/api/ai/grade', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify({ submission_id: subId }),
			});
			const json = await res.json();
			if (json.success) {
				gradeResult = json.data;
			} else {
				error = json.error || 'Gagal menilai';
			}
		} catch (e) {
			error = 'Gagal menjalankan penilaian AI';
		} finally {
			grading = null;
		}
	}

	function selectSub(sub: Submission) {
		selectedSub = sub;
		gradeResult = null;
		error = '';
	}

	function closeResult() {
		selectedSub = null;
		gradeResult = null;
		loadSubmissions();
	}

	function formatDate(d: string): string {
		if (!d) return '-';
		return new Date(d + (d.includes('T') ? '' : 'T00:00:00Z')).toLocaleDateString('id-ID', {
			day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
		});
	}

	// Load on mount
	$effect(() => {
		if (browser) loadSubmissions();
	});
</script>

<svelte:head>
	<title>Penilaian AI — RPL AI Curriculum</title>
</svelte:head>

<div class="grade-page">
	<header class="grade-header">
		<div>
			<h1>Penilaian AI</h1>
			<p class="subtitle">Penilaian otomatis tugas esai menggunakan AI</p>
		</div>
		<button onclick={loadSubmissions} disabled={loading} class="refresh-btn">
			{loading ? 'Memuat...' : '🔄 Refresh'}
		</button>
	</header>

	{#if error}
		<div class="error-msg">⚠️ {error}</div>
	{/if}

	{#if selectedSub}
		<!-- Detail submission -->
		<div class="detail-card">
			<div class="detail-header">
				<h2>{selectedSub.assessment_title || selectedSub.assignment_title || 'Submission'}</h2>
				<button onclick={closeResult} class="back-btn">← Kembali</button>
			</div>
			<div class="detail-meta">
				<span>Siswa: <strong>{selectedSub.user_name}</strong></span>
				<span>Dikirim: {formatDate(selectedSub.submitted_at)}</span>
			</div>
			<div class="detail-body">
				<h3>Jawaban:</h3>
				<pre class="answer-text">{selectedSub.submission_text || (typeof selectedSub.answers === 'string' ? selectedSub.answers : JSON.stringify(selectedSub.answers, null, 2)) || 'Tidak ada teks'}</pre>
			</div>

			<button onclick={() => gradeSubmission(selectedSub.id)} disabled={grading === selectedSub.id} class="grade-btn">
				{grading === selectedSub.id ? '⏳ Menilai...' : '🤖 Nilai dengan AI'}
			</button>

			{#if gradeResult}
				<div class="grade-result">
					<div class="score-display">
						<span class="score-value" class:good={gradeResult.score >= 70} class:medium={gradeResult.score >= 40 && gradeResult.score < 70} class:low={gradeResult.score < 40}>
							{gradeResult.score}
						</span>
						<span class="score-max">/{gradeResult.max_score}</span>
					</div>
					<div class="feedback-section">
						<h3>Feedback:</h3>
						<p>{gradeResult.feedback}</p>
					</div>
					{#if gradeResult.strengths?.length > 0}
						<div class="strengths">
							<h4>✅ Kelebihan:</h4>
							<ul>
								{#each gradeResult.strengths as s}
									<li>{s}</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if gradeResult.weaknesses?.length > 0}
						<div class="weaknesses">
							<h4>⚠️ Perlu Perbaikan:</h4>
							<ul>
								{#each gradeResult.weaknesses as w}
									<li>{w}</li>
								{/each}
							</ul>
						</div>
					{/if}
					{#if gradeResult.ai_failed}
						<p class="ai-warning">⚠️ Penilaian AI gagal, skor berdasarkan estimasi. Perlu review manual.</p>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<!-- Submission lists -->
		<div class="submission-lists">
			<section class="sub-list">
				<h2>Penilaian Tugas ({submissions.assessment_submissions.length})</h2>
				{#if submissions.assessment_submissions.length === 0}
					<div class="empty">Tidak ada tugas yang perlu dinilai</div>
				{:else}
					{#each submissions.assessment_submissions as sub}
						<button onclick={() => selectSub(sub)} class="sub-card">
							<div class="sub-info">
								<span class="sub-title">{sub.assessment_title || 'Tugas'}</span>
								<span class="sub-user">{sub.user_name}</span>
							</div>
							<span class="sub-date">{formatDate(sub.submitted_at)}</span>
						</button>
					{/each}
				{/if}
			</section>

			<section class="sub-list">
				<h2>Penilaian Esai ({submissions.assignment_submissions.length})</h2>
				{#if submissions.assignment_submissions.length === 0}
					<div class="empty">Tidak ada esai yang perlu dinilai</div>
				{:else}
					{#each submissions.assignment_submissions as sub}
						<button onclick={() => selectSub(sub)} class="sub-card">
							<div class="sub-info">
								<span class="sub-title">{sub.assignment_title || 'Esai'}</span>
								<span class="sub-user">{sub.user_name}</span>
							</div>
							<span class="sub-date">{formatDate(sub.submitted_at)}</span>
						</button>
					{/each}
				{/if}
			</section>
		</div>
	{/if}
</div>

<style>
	.grade-page {
		max-width: 900px;
		margin: 0 auto;
		padding: 24px 16px 48px;
	}

	.grade-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	.grade-header h1 { font-size: 26px; font-weight: 700; color: var(--text); margin: 0; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 4px 0 0; }

	.refresh-btn {
		padding: 8px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		font-size: 13px;
	}
	.refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.error-msg {
		padding: 12px 16px;
		background: rgba(239, 68, 68, 0.08);
		color: var(--danger);
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 13px;
	}

	.submission-lists {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.sub-list h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px; color: var(--text); }

	.sub-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		cursor: pointer;
		transition: border-color 0.15s;
		margin-bottom: 8px;
		text-align: left;
		font: inherit;
		color: inherit;
	}
	.sub-card:hover { border-color: var(--accent); }

	.sub-info { display: flex; flex-direction: column; gap: 2px; }
	.sub-title { font-size: 14px; font-weight: 500; color: var(--text); }
	.sub-user { font-size: 12px; color: var(--text-secondary); }
	.sub-date { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }

	.empty { padding: 32px; text-align: center; color: var(--text-secondary); font-size: 14px; background: var(--surface); border: 1px dashed var(--border); border-radius: 8px; }

	.detail-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
	.detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
	.detail-header h2 { font-size: 18px; margin: 0; }
	.back-btn { padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.detail-meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; flex-wrap: wrap; }
	.detail-body { margin-bottom: 16px; }
	.detail-body h3 { font-size: 14px; margin: 0 0 8px; }
	.answer-text { background: var(--bg); padding: 12px; border-radius: 8px; font-size: 13px; max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-break: break-word; }

	.grade-btn {
		padding: 10px 24px;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.grade-btn:hover:not(:disabled) { opacity: 0.9; }
	.grade-btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.grade-result {
		margin-top: 20px;
		padding: 20px;
		border: 1px solid var(--accent-dim);
		border-radius: 12px;
		background: rgba(99, 102, 241, 0.04);
	}

	.score-display { text-align: center; margin-bottom: 16px; }
	.score-value { font-size: 48px; font-weight: 800; }
	.score-value.good { color: var(--success, #22c55e); }
	.score-value.medium { color: var(--warning, #f59e0b); }
	.score-value.low { color: var(--danger, #ef4444); }
	.score-max { font-size: 20px; color: var(--text-secondary); }
	.feedback-section h3 { font-size: 14px; margin: 0 0 8px; }
	.feedback-section p { font-size: 14px; line-height: 1.6; }
	.strengths { margin-top: 12px; }
	.strengths h4 { font-size: 13px; color: var(--success, #22c55e); margin: 0 0 4px; }
	.strengths ul { margin: 0; padding-left: 20px; font-size: 13px; }
	.weaknesses { margin-top: 12px; }
	.weaknesses h4 { font-size: 13px; color: var(--warning, #f59e0b); margin: 0 0 4px; }
	.weaknesses ul { margin: 0; padding-left: 20px; font-size: 13px; }
	.ai-warning { margin-top: 12px; font-size: 13px; color: var(--warning); padding: 8px; background: rgba(245, 158, 11, 0.1); border-radius: 6px; }

	@media (max-width: 640px) {
		.grade-header { flex-direction: column; gap: 12px; }
	}
</style>

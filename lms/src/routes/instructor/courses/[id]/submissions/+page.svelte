<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Button } from '$lib/components/ui';

	let offeringId = $state('');
	let submissions = $state<any[]>([]);
	let loading = $state(true);
	let error = $state('');
	let scoreDraft = $state<Record<string, string>>({});
	let feedbackDraft = $state<Record<string, string>>({});
	let gradingId = $state<string | null>(null);

	onMount(() => {
		if (!browser) return;
		offeringId = $page.url.pathname.split('/')[3];
		loadSubmissions();
	});

	async function loadSubmissions() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}/submissions`);
			const json = await res.json();
			if (json.success) submissions = json.data || [];
			else error = json.error || 'Gagal memuat';
		} catch { error = 'Gagal terhubung'; }
		finally { loading = false; }
	}

	async function grade(s: any) {
		if (gradingId) return;
		gradingId = s.id;
		try {
			const res = await fetch(`/api/instructor/courses/${offeringId}/submissions/${s.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					score: scoreDraft[s.id] !== undefined && scoreDraft[s.id] !== '' ? Number(scoreDraft[s.id]) : undefined,
					feedback: feedbackDraft[s.id] || undefined,
					status: 'graded'
				})
			});
			const json = await res.json();
			if (json.success) {
				addToast('Nilai tersimpan ✅', 'success');
				await loadSubmissions();
			} else {
				addToast(json.error || 'Gagal menilai', 'error');
			}
		} catch {
			addToast('Gagal menilai', 'error');
		} finally {
			gradingId = null;
		}
	}

	function fmtDate(d: string): string {
		if (!d) return '—';
		return d.replace('T', ' ').slice(0, 16);
	}

	function fileExt(url: string): string {
		const m = url.match(/\.(\w+)(\?|$)/);
		return m ? m[1].toUpperCase() : 'FILE';
	}

	function isImage(url: string): boolean {
		return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
	}
</script>

<svelte:head><title>Review Tugas — RPL AI</title></svelte:head>

<div class="subs-page">
	<header class="page-head">
		<h1>📋 Review Tugas Siswa</h1>
		<p class="subtitle">Nilai pengumpulan tugas dari semua siswa di kelas ini</p>
	</header>

	{#if loading}
		<div class="loading">Memuat...</div>
	{:else if error}
		<div class="error-box">{error}</div>
	{:else if submissions.length === 0}
		<div class="empty">Belum ada pengumpulan tugas 📭</div>
	{:else}
		<div class="subs-list">
			{#each submissions as s}
				<div class="sub-card">
					<div class="sub-head">
						<div class="sub-user">
							<span class="avatar">{s.user_avatar || '👤'}</span>
							<div>
								<strong>{s.user_name || 'Siswa'}</strong>
								<span class="sub-meta">{s.assignment_title} · dikumpul {fmtDate(s.created_at)}</span>
							</div>
						</div>
						<span class="status-badge status-{s.status || 'submitted'}">
							{s.status === 'graded' ? '✅ Dinilai' : s.status === 'returned' ? '↩️ Dikembalikan' : '📤 Dikumpulkan'}
						</span>
					</div>

					{#if s.submission_text}
						<div class="sub-text">{s.submission_text}</div>
					{/if}

					{#if s.file_urls && s.file_urls.length > 0}
						<div class="file-list">
							{#each s.file_urls as url}
								<a class="file-chip" href={url} target="_blank" rel="noopener">
									{#if isImage(url)}
										<img src={url} alt="lampiran" class="file-thumb" loading="lazy" />
									{:else}
										<span class="file-icon">📄</span>
									{/if}
									<span class="file-name">{fileExt(url)}</span>
								</a>
							{/each}
						</div>
					{/if}

					{#if s.score !== null && s.score !== undefined}
						<div class="existing-grade">
							Nilai saat ini: <strong>{s.score}/{s.max_score || 100}</strong>
							{#if s.feedback}<span class="existing-fb">— {s.feedback}</span>{/if}
						</div>
					{/if}

					<div class="grade-row">
						<input
							type="number"
							class="score-input"
							placeholder={`Nilai /${s.max_score || 100}`}
							min="0"
							max={s.max_score || 100}
							bind:value={scoreDraft[s.id]}
						/>
						<input
							type="text"
							class="fb-input"
							placeholder="Feedback untuk siswa..."
							bind:value={feedbackDraft[s.id]}
						/>
						<Button
							variant="primary"
							onclick={() => grade(s)}
							disabled={gradingId === s.id}
						>
							{gradingId === s.id ? 'Menyimpan...' : '💾 Simpan Nilai'}
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.subs-page { max-width: 860px; margin: 0 auto; padding: 8px 16px 48px; }
	.page-head h1 { font-size: 22px; margin: 0 0 4px; }
	.subtitle { color: var(--text-secondary); font-size: 13px; margin: 0 0 24px; }
	.loading, .error-box, .empty { padding: 32px; text-align: center; color: var(--text-secondary); font-size: 14px; }
	.error-box { color: var(--danger); }
	.subs-list { display: flex; flex-direction: column; gap: 14px; }
	.sub-card {
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 14px;
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.04);
	}
	.sub-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
	.sub-user { display: flex; gap: 10px; align-items: center; }
	.sub-user strong { display: block; font-size: 14px; }
	.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--surface-alt); display: flex; align-items: center; justify-content: center; font-size: 18px; overflow: hidden; }
	.avatar img { width: 100%; height: 100%; object-fit: cover; }
	.sub-meta { font-size: 11px; color: var(--text-muted); }
	.status-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; flex-shrink: 0; }
	.status-submitted { background: var(--accent-light); color: var(--accent); }
	.status-graded { background: var(--success-light); color: var(--success); }
	.status-returned { background: var(--warning-light); color: var(--warning); }
	.sub-text {
		background: var(--bg);
		border: 1px solid var(--surface-alt);
		border-radius: 10px;
		padding: 12px;
		font-size: 13px;
		white-space: pre-wrap;
		line-height: 1.55;
	}
	.file-list { display: flex; gap: 10px; flex-wrap: wrap; }
	.file-chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		text-decoration: none;
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 600;
		background: var(--bg);
		transition: border-color 0.15s;
	}
	.file-chip:hover { border-color: var(--accent); }
	.file-thumb { width: 32px; height: 32px; object-fit: cover; border-radius: 6px; }
	.file-icon { font-size: 18px; }
	.existing-grade { font-size: 12px; color: var(--text-secondary); background: var(--bg); border-radius: 8px; padding: 8px 12px; }
	.existing-fb { color: var(--text-muted); }
	.grade-row { display: flex; gap: 8px; flex-wrap: wrap; }
	.score-input {
		width: 110px;
		padding: 9px 10px;
		border: 1px solid var(--border);
		border-radius: 9px;
		font-size: 13px;
		font-family: inherit;
	}
	.fb-input { flex: 1; min-width: 160px; padding: 9px 10px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; font-family: inherit; }
	@media (max-width: 560px) {
		.sub-head { flex-direction: column; }
		.grade-row { flex-direction: column; }
		.score-input, .fb-input { width: 100%; }
	}
</style>

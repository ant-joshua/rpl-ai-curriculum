<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { SearchBar, PageHeader, EmptyState } from '$lib/components/ui';

	let offeringId = $state('');
	let offering: any = $state(null);
	let assignments: any[] = $state([]);
	let submissionsByAssignment: Record<string, any[]> = $state({});
	let loading = $state(true);
	let error = $state('');
	let searchQuery = $state('');
	let expandedAssignment = $state<string | null>(null);

	// Grading modal
	let showGradeModal = $state(false);
	let gradingSubmission: any = $state(null);
	let gradeScore = $state('');
	let gradeMaxScore = $state(100);
	let gradeFeedback = $state('');
	let savingGrade = $state(false);
	let gradeError = $state('');

	$effect(() => {
		if (browser) {
			offeringId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		if (!offeringId) { setTimeout(() => loadData(), 100); return; }
		loading = true;
		error = '';
		try {
			const [offRes, assignRes, subRes] = await Promise.all([
				fetch(`/api/admin/course-offerings/${offeringId}`),
				fetch(`/api/admin/assignments?course_offering_id=${offeringId}`),
				fetch(`/api/admin/assignment-submissions?assignment_id=all&course_offering_id=${offeringId}`),
			]);
			const offJson = await offRes.json();
			const assignJson = await assignRes.json();
			const subJson = await subRes.json();

			if (offJson.success) offering = offJson.data;
			else { error = offJson.error || 'Failed'; return; }

			assignments = assignJson.success ? (assignJson.data || []) : [];
			const allSubs = subJson.success ? (subJson.data || []) : [];

			// Group submissions by assignment
			const grouped: Record<string, any[]> = {};
			for (const sub of allSubs) {
				const aid = sub.assignment_id;
				if (!grouped[aid]) grouped[aid] = [];
				grouped[aid].push(sub);
			}
			submissionsByAssignment = grouped;

			// Auto-expand first assignment with submissions
			for (const a of assignments) {
				if (grouped[a.id]?.length > 0) {
					expandedAssignment = a.id;
					break;
				}
			}
			if (!expandedAssignment && assignments.length > 0) {
				expandedAssignment = assignments[0].id;
			}
		} catch { error = 'Network error'; }
		finally { loading = false; }
	}

	function toggleAssignment(id: string) {
		expandedAssignment = expandedAssignment === id ? null : id;
	}

	function getSubmissions(assignmentId: string): any[] {
		return submissionsByAssignment[assignmentId] || [];
	}

	function statusBadge(status: string): string {
		const map: Record<string, string> = {
			graded: 'bg--graded',
			submitted: 'bg--submitted',
			returned: 'bg--returned',
			draft: 'bg--draft',
		};
		return map[status] || 'bg--draft';
	}

	function statusLabel(status: string): string {
		const map: Record<string, string> = {
			graded: 'Dinilai',
			submitted: 'Dikumpulkan',
			returned: 'Dikembalikan',
			draft: 'Draft',
		};
		return map[status] || status;
	}

	function formatDate(d: string | null): string {
		if (!d) return '-';
		try { return new Date(d + 'Z').toLocaleDateString('id-ID', {
			year: 'numeric', month: 'short', day: 'numeric',
			hour: '2-digit', minute: '2-digit'
		}); } catch { return d; }
	}

	function openGradeModal(sub: any, maxScore: number) {
		gradingSubmission = sub;
		gradeScore = sub.score != null ? String(sub.score) : '';
		gradeMaxScore = maxScore;
		gradeFeedback = sub.feedback || '';
		gradeError = '';
		showGradeModal = true;
	}

	function closeGradeModal() {
		showGradeModal = false;
		gradingSubmission = null;
	}

	async function saveGrade() {
		if (!gradingSubmission) return;
		savingGrade = true;
		gradeError = '';
		const score = parseFloat(gradeScore);
		if (isNaN(score) || score < 0) {
			gradeError = 'Nilai tidak valid';
			savingGrade = false;
			return;
		}

		try {
			const res = await fetch(`/api/admin/assignment-submissions/${gradingSubmission.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					score,
					feedback: gradeFeedback,
					status: 'graded',
					graded_by: localStorage.getItem('lms-user-id') || null,
					graded_at: new Date().toISOString(),
				}),
			});
			const json = await res.json();
			if (json.success) {
				loadData(); // refresh
				closeGradeModal();
			} else {
				gradeError = json.error || 'Gagal menyimpan';
			}
		} catch { gradeError = 'Network error'; }
		finally { savingGrade = false; }
	}

	async function markAsReturned(sub: any) {
		try {
			await fetch(`/api/admin/assignment-submissions/${sub.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'returned' }),
			});
			loadData();
		} catch {}
	}

	function fileCount(urls: string | null): number {
		if (!urls) return 0;
		try { return JSON.parse(urls).length; } catch { return 0; }
	}

	function isLate(sub: any, dueDate: string | null): boolean {
		if (!dueDate || !sub.submitted_at) return false;
		return new Date(sub.submitted_at) > new Date(dueDate + 'Z');
	}

	function filteredSubs(subs: any[]): any[] {
		if (!searchQuery) return subs;
		const q = searchQuery.toLowerCase();
		return subs.filter(s =>
			(s.user_name || '').toLowerCase().includes(q) ||
			(s.email || '').toLowerCase().includes(q)
		);
	}
</script>

<svelte:head>
	<title>Penilaian — {offering?.name || 'Assignment'} — RPL AI Curriculum</title>
</svelte:head>

<div class="grading-page">
	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<!-- Header -->
		<div class="breadcrumb">
			<a href="/admin/assignments">← Assignment Management</a>
		</div>
		<PageHeader title={offering?.name || ''} subtitle="{assignments.length} assignment(s){offering?.code ? ' — ' + offering.code : ''}">
			{#snippet action()}
				<span class="status-badge status--{offering?.status}">{offering?.status}</span>
			{/snippet}
		</PageHeader>
				<SearchBar bind:value={searchQuery} placeholder="Cari mahasiswa..." />

		<!-- Assignments list -->
		{#if assignments.length === 0}
			<EmptyState icon="📋" title="Belum ada assignment" description="Belum ada assignment di offering ini." />
		{:else}
			<div class="assignments-list">
				{#each assignments as a}
					{@const subs = getSubmissions(a.id)}
					{@const filtered = filteredSubs(subs)}
					{@const gradedCount = subs.filter((s: any) => s.status === 'graded').length}
					{@const totalCount = subs.length}
					<div class="assignment-card">
						<button
							class="assignment-header"
							onclick={() => toggleAssignment(a.id)}
						>
							<div class="header-left">
								<h3>{a.title}</h3>
								<div class="assignment-meta">
									<span>📊 {a.max_score} poin</span>
									<span>📁 {a.submission_type}</span>
									<span>📅 {a.due_date ? formatDate(a.due_date) : 'No due'}</span>
								</div>
							</div>
							<div class="header-right">
								<span class="progress-badge">
									{gradedCount}/{totalCount} dinilai
								</span>
								<span class="expand-icon">{expandedAssignment === a.id ? '▼' : '▶'}</span>
							</div>
						</button>

						{#if expandedAssignment === a.id}
							<div class="assignment-body">
								{#if subs.length === 0}
									<div class="empty-state">Belum ada submission</div>
								{:else if filtered.length === 0}
									<div class="empty-state">Tidak ada mahasiswa yang cocok</div>
								{:else}
									<div class="table-wrapper">
										<table class="submissions-table">
											<thead>
												<tr>
													<th>Mahasiswa</th>
													<th>Status</th>
													<th>Submission</th>
													<th>Score</th>
													<th>Submitted</th>
													<th>Feedback</th>
													<th>Aksi</th>
												</tr>
											</thead>
											<tbody>
												{#each filtered as sub}
													<tr class:row--late={isLate(sub, a.due_date)}>
														<td class="student-cell">
															<span class="student-name">{sub.user_name || '-'}</span>
														</td>
														<td>
															<span class="status-badge {statusBadge(sub.status)}">{statusLabel(sub.status)}</span>
															{#if isLate(sub, a.due_date)}
																<span class="late-badge">Terlambat</span>
															{/if}
														</td>
														<td>
															{#if sub.file_urls}
																<span class="submission-info">{fileCount(sub.file_urls)} file(s)</span>
															{:else if sub.submission_text}
																<span class="submission-info">📝 Teks</span>
															{:else}
																<span class="submission-info">-</span>
															{/if}
														</td>
														<td class="score-cell">
															{#if sub.score != null}
																<span class="score-value">{sub.score}</span>
																<span class="score-max">/ {sub.max_score}</span>
															{:else}
																<span class="score-na">-</span>
															{/if}
														</td>
														<td class="date-cell">{formatDate(sub.submitted_at)}</td>
														<td class="feedback-preview">{sub.feedback ? sub.feedback.slice(0, 40) + (sub.feedback.length > 40 ? '…' : '') : '-'}</td>
														<td class="actions-cell">
															<button class="btn btn--grade" onclick={() => openGradeModal(sub, a.max_score)}>
																{sub.score != null ? 'Edit' : 'Nilai'}
															</button>
															{#if sub.status === 'graded'}
																<button class="btn btn--return" onclick={() => markAsReturned(sub)}>
																	↩
																</button>
															{/if}
															{#if sub.file_urls || sub.submission_text}
																<button
																	class="btn btn--view"
																	onclick={() => openGradeModal(sub, a.max_score)}
																>
																	👁
																</button>
															{/if}
														</td>
													</tr>
												{/each}
											</tbody>
										</table>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<!-- Grade Modal -->
{#if showGradeModal && gradingSubmission}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeGradeModal} role="dialog" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="modal-header">
				<h2>Penilaian</h2>
				<button class="modal-close" onclick={closeGradeModal}>✕</button>
			</div>

			<div class="modal-body">
				<div class="modal-student">
					<strong>{gradingSubmission.user_name || 'Unknown'}</strong>
				</div>

				{#if gradingSubmission.submission_text}
					<div class="modal-section">
						<label>Submission Teks</label>
						<pre class="modal-text">{gradingSubmission.submission_text}</pre>
					</div>
				{/if}

				{#if gradingSubmission.file_urls}
					{@const urls = JSON.parse(gradingSubmission.file_urls) as string[]}
					{#if urls.length > 0}
						<div class="modal-section">
							<label>Files ({urls.length})</label>
							<div class="modal-files">
								{#each urls as url}
									<a href={url} target="_blank" class="file-link" rel="noreferrer">
										📎 {url.split('/').pop()}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				{/if}

				<div class="modal-section">
					<label for="grade-score">Nilai</label>
					<div class="score-input-row">
						<input
							id="grade-score"
							type="number"
							step="0.5"
							min="0"
							max={gradeMaxScore}
							bind:value={gradeScore}
							class="score-input"
						/>
						<span class="score-divider">/</span>
						<span class="score-max-label">{gradeMaxScore}</span>
					</div>
				</div>

				<div class="modal-section">
					<label for="grade-feedback">Feedback (opsional)</label>
					<textarea
						id="grade-feedback"
						bind:value={gradeFeedback}
						rows="4"
						placeholder="Berikan komentar untuk mahasiswa..."
						class="feedback-input"
					></textarea>
				</div>

				{#if gradeError}
					<div class="grade-error">{gradeError}</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn btn--cancel" onclick={closeGradeModal}>Batal</button>
				<button class="btn btn--save" onclick={saveGrade} disabled={savingGrade}>
					{savingGrade ? 'Menyimpan...' : 'Simpan Nilai'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.grading-page {
		max-width: 1100px;
	}

	.loading, .error {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error { color: #ef4444; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
		gap: 16px;
	}
	.breadcrumb {
		font-size: 13px;
		margin-bottom: 8px;
	}
	.breadcrumb a {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
	}
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 {
		margin: 0 0 4px;
		font-size: 24px;
	}
	.offering-meta {
		font-size: 13px;
		color: var(--text-secondary);
		margin: 0;
		display: flex;
		gap: 10px;
		align-items: center;
	}
	.status--active { background: #22c55e33; color: #22c55e; }
	.status--draft { background: var(--bg-secondary); color: var(--text-secondary); }
	.status--archived { background: #8a8f9833; color: #8a8f98; }
	.status--completed { background: #3b82f633; color: #3b82f6; }

	.header-actions { flex-shrink: 0; }
	.search-input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		width: 220px;
		font-family: inherit;
	}
	.search-input:focus {
		border-color: var(--accent);
		outline: none;
	}

	.empty-state {
		padding: 40px 20px;
		text-align: center;
		color: var(--text-secondary);
		font-size: 14px;
	}

	.assignments-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.assignment-card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
	}
	.assignment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		width: 100%;
		background: none;
		border: none;
		color: var(--text);
		font-family: inherit;
		cursor: pointer;
		transition: background 0.1s;
		text-align: left;
	}
	.assignment-header:hover { background: var(--hover); }
	.header-left h3 {
		margin: 0 0 6px;
		font-size: 16px;
	}
	.assignment-meta {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: var(--text-secondary);
	}
	.header-right {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
	}
	.progress-badge {
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 99px;
		background: var(--bg-secondary);
		font-weight: 600;
	}
	.expand-icon { font-size: 12px; color: var(--text-secondary); }

	.assignment-body {
		border-top: 1px solid var(--border);
		padding: 12px 20px 20px;
	}

	/* Table */
	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	.submissions-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}
	.submissions-table th {
		text-align: left;
		padding: 8px 12px;
		border-bottom: 2px solid var(--border);
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.submissions-table td {
		padding: 8px 12px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}
	.submissions-table tr:hover td { background: var(--hover); }
	.submissions-table tr:last-child td { border-bottom: none; }
	.row--late { background: rgba(231, 76, 60, 0.03); }

	.student-name { font-weight: 600; font-size: 13px; }

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 99px;
		font-size: 11px;
		font-weight: 600;
	}
	.bg--graded { background: #22c55e33; color: #22c55e; }
	.bg--submitted { background: #3b82f633; color: #3b82f6; }
	.bg--returned { background: #f59e0b33; color: #f59e0b; }
	.bg--draft { background: var(--bg-secondary); color: var(--text-secondary); }

	.late-badge {
		display: inline-block;
		margin-left: 4px;
		padding: 1px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		background: #ef444422;
		color: #ef4444;
	}

	.submission-info { font-size: 12px; color: var(--text-secondary); }

	.score-cell { font-weight: 600; }
	.score-value { font-size: 15px; }
	.score-max { font-size: 12px; color: var(--text-secondary); }
	.score-na { color: var(--text-secondary); }

	.date-cell { font-size: 12px; color: var(--text-secondary); white-space: nowrap; }

	.feedback-preview {
		font-size: 12px;
		color: var(--text-secondary);
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions-cell {
		white-space: nowrap;
		display: flex;
		gap: 4px;
	}

	.btn {
		padding: 5px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-family: inherit;
		transition: all 0.1s;
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}
	.btn:hover { background: var(--hover); }
	.btn--grade { background: var(--accent); color: #fff; border-color: var(--accent); }
	.btn--grade:hover { opacity: 0.9; }
	.btn--return { color: #f59e0b; border-color: #f59e0b33; }
	.btn--return:hover { background: #f59e0b22; }
	.btn--view { color: var(--text-secondary); border-color: transparent; }
	.btn--view:hover { background: var(--hover); }
	.btn--save { background: #22c55e; color: #fff; border-color: #22c55e; }
	.btn--save:hover { opacity: 0.9; }
	.btn--cancel { color: var(--text-secondary); }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}
	.modal-content {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 14px;
		width: 100%;
		max-width: 560px;
		max-height: 90vh;
		overflow-y: auto;
	}
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px 0;
	}
	.modal-header h2 { margin: 0; font-size: 18px; }
	.modal-close {
		background: none;
		border: none;
		font-size: 18px;
		cursor: pointer;
		color: var(--text-secondary);
		padding: 4px 8px;
		border-radius: 6px;
	}
	.modal-close:hover { background: var(--hover); }
	.modal-body { padding: 20px 24px; }
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 16px 24px;
		border-top: 1px solid var(--border);
	}
	.modal-student { margin-bottom: 16px; font-size: 15px; }
	.modal-section { margin-bottom: 16px; }
	.modal-section label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
	}
	.modal-text {
		font-size: 13px;
		padding: 10px;
		background: var(--bg);
		border-radius: 8px;
		white-space: pre-wrap;
		font-family: monospace;
		margin: 0;
		max-height: 150px;
		overflow-y: auto;
	}
	.modal-files { display: flex; flex-direction: column; gap: 4px; }
	.file-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 13px;
		text-decoration: none;
		color: var(--accent);
	}
	.file-link:hover { border-color: var(--accent); }

	.score-input-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.score-input {
		width: 100px;
		padding: 10px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 20px;
		font-weight: 700;
		text-align: center;
	}
	.score-input:focus { border-color: var(--accent); outline: none; }
	.score-divider { font-size: 20px; font-weight: 700; color: var(--text-secondary); }
	.score-max-label { font-size: 16px; color: var(--text-secondary); font-weight: 600; }

	.feedback-input {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-family: inherit;
		font-size: 14px;
		resize: vertical;
		box-sizing: border-box;
	}
	.feedback-input:focus { border-color: var(--accent); outline: none; }

	.grade-error {
		padding: 8px 12px;
		background: #ef444422;
		color: #ef4444;
		border-radius: 6px;
		font-size: 13px;
	}
</style>

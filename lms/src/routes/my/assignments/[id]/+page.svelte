<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';

	let loading = $state(true);
	let error = $state('');
	let assignment: any = $state(null);
	let enrollment: any = $state(null);
	let submission: any = $state(null);
	let isLate = $state(false);
	let canSubmit = $state(false);

	// Form state
	let submissionText = $state('');
	let fileUrls: string[] = $state([]);
	let fileNames: string[] = $state([]);
	let uploading = $state(false);
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError = $state('');

	let assignmentId = $state('');
	let dropzoneActive = $state(false);

	let isSubmitting = $derived(submitting || uploading);

	let statusBadge = $derived.by(() => {
		if (!submission) return { text: 'Belum Dikumpulkan', cls: 'status--pending' };
		switch (submission.status) {
			case 'submitted': return { text: 'Dikumpulkan', cls: 'status--submitted' };
			case 'graded': return { text: 'Dinilai', cls: 'status--graded' };
			case 'returned': return { text: 'Dikembalikan', cls: 'status--returned' };
			default: return { text: 'Draft', cls: 'status--draft' };
		}
	});

	let formattedStatus = $derived(statusBadge);
	let dueLabel = $derived.by(() => {
		if (!assignment?.due_date) return 'Tidak ada batas waktu';
		const d = new Date(assignment.due_date + 'Z');
		return d.toLocaleDateString('id-ID', {
			weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	});

	let submissionTypeLabel = $derived.by(() => {
		const map: Record<string, string> = {
			file: 'Upload File',
			text: 'Teks',
			code: 'Kode',
			link: 'URL/Link',
			github: 'GitHub Repository'
		};
		return map[assignment?.submission_type] || 'File';
	});

	$effect(() => {
		if (browser) {
			assignmentId = $page.url.pathname.split('/').pop() || '';
		}
	});

	onMount(() => {
		if (!browser) return;
		loadAssignment();
	});

	async function loadAssignment() {
		loading = true;
		error = '';
		try {
			const res = await api(`/api/my/assignments/${assignmentId}`);
			if (!res.success) { error = res.error || 'Failed to load'; return; }
			const d = res.data!;
			assignment = d.assignment;
			enrollment = d.enrollment;
			submission = d.submission;
			isLate = d.isLate;
			canSubmit = d.canSubmit;
			if (submission) {
				submissionText = submission.submission_text || '';
				fileUrls = submission.file_urls ? JSON.parse(submission.file_urls) : [];
			}
		} catch { error = 'Network error'; }
		finally { loading = false; }
	}

	async function uploadFiles(fileList: FileList | null) {
		if (!fileList || fileList.length === 0) return;
		uploading = true;
		submitError = '';
		try {
			for (let i = 0; i < fileList.length; i++) {
				const file = fileList[i];
				if (file.size > 20 * 1024 * 1024) {
					submitError = `${file.name} terlalu besar (max 20MB)`;
					continue;
				}
				const formData = new FormData();
				formData.append('file', file);
				const res = await fetch('/api/upload', {
					method: 'POST',
					headers: { Authorization: `Bearer ${localStorage.getItem('lms-auth-token')}` },
					body: formData,
				});
				const json = await res.json();
				if (json.success) {
					fileUrls = [...fileUrls, json.data.url];
					fileNames = [...fileNames, json.data.fileName];
				} else {
					submitError = json.error || `Gagal upload ${file.name}`;
				}
			}
		} catch { submitError = 'Upload error'; }
		finally { uploading = false; }
	}

	function removeFile(index: number) {
		fileUrls = fileUrls.filter((_, i) => i !== index);
		fileNames = fileNames.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		if (isSubmitting) return;
		if (assignment.submission_type === 'file' && fileUrls.length === 0) {
			submitError = 'Harap upload file';
			return;
		}
		if ((assignment.submission_type === 'text' || assignment.submission_type === 'link' || assignment.submission_type === 'github')
			&& !submissionText.trim()) {
			submitError = 'Harap isi teks submission';
			return;
		}

		submitting = true;
		submitError = '';
		try {
			const res = await api(`/api/my/assignments/${assignmentId}`, {
				method: 'POST',
				body: JSON.stringify({ submission_text: submissionText, file_urls: fileUrls }),
			});
			if (res.success) {
				submitted = true;
				submission = { ...submission, status: 'submitted', submission_text: submissionText, file_urls: JSON.stringify(fileUrls) };
			} else {
				submitError = res.error || 'Gagal mengumpulkan';
			}
		} catch { submitError = 'Network error'; }
		finally { submitting = false; }
	}

	function unixStyleFilename(url: string): string {
		// Extract filename from URL like /api/upload/assignments/uuid.ext
		const parts = url.split('/');
		return parts[parts.length - 1] || url;
	}

	function fileIcon(name: string): string {
		const ext = name.split('.').pop()?.toLowerCase() || '';
		const icons: Record<string, string> = {
			pdf: '📄',
			doc: '📝', docx: '📝',
			xls: '📊', xlsx: '📊',
			ppt: '📽️', pptx: '📽️',
			zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
			jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️',
			mp4: '🎬', mov: '🎬', avi: '🎬',
			mp3: '🎵', wav: '🎵',
			py: '🐍', js: '📜', ts: '📜', html: '🌐', css: '🎨',
			txt: '📃',
		};
		return icons[ext] || '📎';
	}
</script>

<svelte:head>
	<title>{assignment?.title || 'Assignment'} — RPL AI Curriculum</title>
</svelte:head>

<div class="assignment-page">
	{#if loading}
		<div class="loading">Memuat assignment...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<!-- Breadcrumb -->
		<div class="breadcrumb">
			<a href="/my/dashboard">Dashboard</a>
			<span>/</span>
			<a href="/my/grades">Grades</a>
			<span>/</span>
			<span class="current">{assignment.title}</span>
		</div>

		<!-- Header -->
		<div class="header">
			<div class="header-left">
				<h1>{assignment.title}</h1>
				<div class="meta-row">
					<span class="meta-badge">{assignment.offering_name}</span>
					<span class="meta-badge">{submissionTypeLabel}</span>
					<span class="meta-badge">{assignment.max_score} poin</span>
				</div>
				<p class="due-date">📅 Batas: {dueLabel}</p>
				{#if isLate}
					<div class="late-warning">⚠️ Batas waktu telah lewat</div>
				{/if}
			</div>
			<div class="header-right">
				<span class="status-badge {formattedStatus.cls}">{formattedStatus.text}</span>
			</div>
		</div>

		<!-- Description -->
		{#if assignment.description}
			<div class="card description-card">
				<h3>Deskripsi</h3>
				<div class="description">{assignment.description}</div>
			</div>
		{/if}

		<!-- Submission Result -->
		{#if submitted || (submission && submission.status !== 'draft')}
			<div class="card result-card">
				<div class="result-header">
					<span class="result-icon">✅</span>
					<h3>Submission Berhasil</h3>
				</div>

				{#if submissionText}
					<div class="result-section">
						<h4>Submission Teks</h4>
						<div class="result-text">{submissionText}</div>
					</div>
				{/if}

				{#if fileUrls.length > 0}
					<div class="result-section">
						<h4>File Terupload</h4>
						<div class="file-list">
							{#each fileUrls as url, i}
								<a href={url} target="_blank" class="file-chip" rel="noreferrer">
									{fileIcon(fileNames[i] || unixStyleFilename(url))}
									<span>{fileNames[i] || unixStyleFilename(url)}</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<div class="result-meta">
					<span>Dikumpulkan: {submission?.submitted_at ? new Date(submission.submitted_at + 'Z').toLocaleString('id-ID') : 'sekarang'}</span>
					<span>Status: {formattedStatus.text}</span>
				</div>

				{#if submission?.status === 'graded'}
					<div class="grade-result">
						<span class="grade-label">Nilai:</span>
						<span class="grade-score">{submission.score} / {submission.max_score}</span>
						{#if submission.max_score > 0}
							<span class="grade-pct" style="color: {submission.score / submission.max_score >= 0.8 ? '#2ecc71' : submission.score / submission.max_score >= 0.6 ? '#f1c40f' : '#e74c3c'}">
								({Math.round(submission.score / submission.max_score * 100)}%)
							</span>
						{/if}
					</div>
					{#if submission.feedback}
						<div class="feedback-section">
							<h4>Feedback Instruktur</h4>
							<div class="feedback-text">{submission.feedback}</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}

		<!-- Submit Form (show if not yet submitted) -->
		{#if canSubmit && (!submission || submission.status === 'draft')}
			<div class="card submit-card">
				<h3>Kumpulkan Tugas</h3>

				<!-- File upload type -->
				{#if assignment.submission_type === 'file'}
					<div class="form-group">
						<label>Upload File</label>
						<div
							class="dropzone"
							class:dropzone--active={dropzoneActive}
							ondragover={(e) => { e.preventDefault(); dropzoneActive = true; }}
							ondragleave={() => dropzoneActive = false}
							ondrop={(e) => { e.preventDefault(); dropzoneActive = false; uploadFiles(e.dataTransfer?.files || null); }}
							role="button"
							tabindex="0"
							onclick={() => document.getElementById('file-input')?.click()}
							onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
						>
							<span class="dropzone-icon">📁</span>
							<span>Drag & drop file di sini, atau klik untuk pilih</span>
							<span class="dropzone-hint">Max 20MB per file</span>
						</div>
						<input
							id="file-input"
							type="file"
							multiple
							class="file-input-hidden"
							onchange={(e) => uploadFiles((e.target as HTMLInputElement).files)}
						/>
					</div>

					{#if fileUrls.length > 0}
						<div class="form-group">
							<label>File Terpilih</label>
							<div class="file-list">
								{#each fileUrls as url, i}
									<div class="file-chip file-chip--removable">
										{fileIcon(fileNames[i] || unixStyleFilename(url))}
										<span>{fileNames[i] || unixStyleFilename(url)}</span>
										<button
											class="file-remove"
											onclick={() => removeFile(i)}
											disabled={uploading}
											aria-label="Remove file"
										>✕</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{/if}

				<!-- Text/link/github submission type -->
				{#if assignment.submission_type === 'text' || assignment.submission_type === 'link' || assignment.submission_type === 'github' || assignment.submission_type === 'code'}
					<div class="form-group">
						<label for="submission-text">
							{assignment.submission_type === 'github' ? 'GitHub Repository URL' :
							 assignment.submission_type === 'link' ? 'URL Link' :
							 assignment.submission_type === 'code' ? 'Kode/Teks' : 'Teks Jawaban'}
						</label>
						{#if assignment.submission_type === 'text' || assignment.submission_type === 'code'}
							<textarea
								id="submission-text"
								bind:value={submissionText}
								rows="8"
								placeholder="Tulis jawaban Anda di sini..."
								class="text-input"
							></textarea>
						{:else}
							<input
								id="submission-text"
								type="url"
								bind:value={submissionText}
								placeholder="https://github.com/username/repo"
								class="url-input"
							/>
						{/if}
					</div>
				{/if}

				{#if submitError}
					<div class="submit-error">{submitError}</div>
				{/if}

				<div class="form-actions">
					<button
						class="btn btn--submit"
						onclick={handleSubmit}
						disabled={isSubmitting}
					>
						{uploading ? 'Mengupload...' : submitting ? 'Mengumpulkan...' : 'Kumpulkan Tugas'}
					</button>
				</div>
			</div>
		{:else if !canSubmit && !submission}
			<div class="card expired-card">
				<span class="expired-icon">🔒</span>
				<h3>Batas Waktu Habis</h3>
				<p>Tidak bisa mengumpulkan tugas karena batas waktu telah lewat.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.assignment-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px 16px 64px;
	}

	.loading, .error {
		padding: 60px 20px;
		text-align: center;
		color: var(--text-secondary);
	}
	.error { color: #e74c3c; }

	.breadcrumb {
		font-size: 13px;
		margin-bottom: 16px;
		display: flex;
		gap: 8px;
		align-items: center;
		color: var(--text-secondary);
	}
	.breadcrumb a { color: var(--accent); text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.breadcrumb .current { color: var(--text); font-weight: 500; }

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
		margin-bottom: 24px;
	}
	.header-left h1 {
		margin: 0 0 8px;
		font-size: 24px;
	}
	.meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
	.meta-badge {
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 99px;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--text-secondary);
	}
	.due-date {
		margin: 0;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.late-warning {
		margin-top: 6px;
		padding: 6px 12px;
		background: #e74c3c22;
		color: #e74c3c;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
	}

	.status-badge {
		display: inline-block;
		padding: 6px 14px;
		border-radius: 99px;
		font-size: 12px;
		font-weight: 600;
		flex-shrink: 0;
	}
	.status--graded { background: #2ecc7133; color: #2ecc71; }
	.status--submitted { background: #3498db33; color: #3498db; }
	.status--returned { background: #f39c1233; color: #f39c12; }
	.status--pending, .status--draft { background: var(--bg-secondary); color: var(--text-secondary); }

	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
		margin-bottom: 20px;
	}

	.description-card h3, .submit-card h3, .result-card h3 {
		margin: 0 0 12px;
		font-size: 16px;
	}
	.description {
		font-size: 14px;
		line-height: 1.6;
		color: var(--text-secondary);
		white-space: pre-wrap;
	}

	/* Result */
	.result-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 16px;
	}
	.result-icon { font-size: 24px; }
	.result-header h3 { margin: 0; }
	.result-section {
		margin-bottom: 16px;
	}
	.result-section h4 {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.result-text {
		font-size: 14px;
		padding: 12px;
		background: var(--bg);
		border-radius: 8px;
		white-space: pre-wrap;
		font-family: monospace;
	}
	.result-meta {
		font-size: 13px;
		color: var(--text-secondary);
		display: flex;
		gap: 16px;
		justify-content: space-between;
		margin-top: 12px;
	}
	.grade-result {
		margin-top: 16px;
		padding: 16px;
		background: var(--bg);
		border-radius: 8px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.grade-label { font-weight: 600; font-size: 14px; }
	.grade-score { font-size: 20px; font-weight: 700; }
	.grade-pct { font-size: 16px; font-weight: 600; }
	.feedback-section { margin-top: 16px; }
	.feedback-section h4 {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0 0 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.feedback-text {
		font-size: 14px;
		line-height: 1.5;
		padding: 12px;
		background: var(--bg);
		border-radius: 8px;
		white-space: pre-wrap;
	}

	/* Form */
	.form-group { margin-bottom: 16px; }
	.form-group label {
		display: block;
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 8px;
		color: var(--text);
	}

	.dropzone {
		border: 2px dashed var(--border);
		border-radius: 10px;
		padding: 32px 20px;
		text-align: center;
		cursor: pointer;
		transition: all 0.15s;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.dropzone:hover, .dropzone--active {
		border-color: var(--accent);
		background: var(--accent-dim);
	}
	.dropzone-icon { font-size: 36px; }
	.dropzone span { font-size: 14px; color: var(--text-secondary); }
	.dropzone-hint { font-size: 12px !important; opacity: 0.7; }

	.file-input-hidden { display: none; }

	.file-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.file-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 13px;
		text-decoration: none;
		color: var(--text);
		transition: all 0.15s;
	}
	.file-chip:hover { border-color: var(--accent); }
	.file-chip--removable {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.file-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: #e74c3c;
		font-size: 14px;
		padding: 2px 6px;
		border-radius: 4px;
		line-height: 1;
		transition: background 0.1s;
	}
	.file-remove:hover { background: rgba(231, 76, 60, 0.15); }
	.file-remove:disabled { opacity: 0.3; }

	.text-input {
		width: 100%;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-family: monospace;
		font-size: 14px;
		line-height: 1.5;
		resize: vertical;
		box-sizing: border-box;
	}
	.text-input:focus { border-color: var(--accent); outline: none; }

	.url-input {
		width: 100%;
		padding: 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font-size: 14px;
		box-sizing: border-box;
	}
	.url-input:focus { border-color: var(--accent); outline: none; }

	.submit-error {
		padding: 10px 14px;
		background: #e74c3c22;
		color: #e74c3c;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 12px;
	}

	.form-actions { display: flex; gap: 8px; }

	.btn {
		padding: 10px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: all 0.15s;
	}
	.btn--submit {
		background: var(--accent);
		color: #fff;
	}
	.btn--submit:hover { opacity: 0.9; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }

	.expired-card {
		text-align: center;
		padding: 40px;
	}
	.expired-icon { font-size: 48px; display: block; margin-bottom: 12px; }
	.expired-card h3 { margin: 0 0 8px; }
	.expired-card p { color: var(--text-secondary); font-size: 14px; margin: 0; }

	@media (max-width: 640px) {
		.assignment-page { padding: 16px 12px 48px; }
		.header { flex-direction: column; gap: 12px; }
		.header-left h1 { font-size: 20px; }
		.breadcrumb { font-size: 12px; flex-wrap: wrap; }
		.card { padding: 16px; }
		.result-meta { flex-direction: column; gap: 6px; }
		.grade-result { flex-wrap: wrap; }
		.dropzone { padding: 24px 16px; }
	}

	@media (max-width: 480px) {
		.form-actions { flex-direction: column; }
		.btn { width: 100%; text-align: center; }
	}
</style>

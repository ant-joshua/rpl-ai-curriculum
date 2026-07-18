<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { api } from '$lib/utils/api';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { Button, Card, Badge } from '$lib/components/ui';

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

	// Code execution state
	let running = $state(false);
	let runResult: any = $state(null);
	let runError = $state('');

	async function handleRun() {
		if (!submissionText.trim()) return;
		running = true;
		runError = '';
		runResult = null;
		try {
			const res = await fetch('/api/code/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: assignment?.language || 'python',
					version: assignment?.language_version || '*',
					code: submissionText
				})
			});
			const json = await res.json();
			if (!json.success) {
				runError = json.error || 'Execution failed';
			} else {
				runResult = json.data;
			}
		} catch (e: any) {
			runError = e.message || 'Network error';
		} finally {
			running = false;
		}
	}

	let statusBadge = $derived.by(() => {
		if (!submission) return { text: 'Belum Dikumpulkan', variant: 'default' as const };
		switch (submission.status) {
			case 'submitted': return { text: 'Dikumpulkan', variant: 'info' as const };
			case 'graded': return { text: 'Dinilai', variant: 'success' as const };
			case 'returned': return { text: 'Dikembalikan', variant: 'warning' as const };
			default: return { text: 'Draft', variant: 'default' as const };
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
		<Breadcrumb items={[
			{ label: 'Grades', href: '/my/grades' },
			{ label: assignment?.title ?? 'Assignment' },
		]} />

		<!-- Header -->
		<div class="header">
			<div class="header-left">
				<h1>{assignment.title}</h1>
				<div class="meta-row">
					<Badge variant="outline">{assignment.offering_name}</Badge>
					<Badge variant="outline">{submissionTypeLabel}</Badge>
					<Badge variant="outline">{assignment.max_score} poin</Badge>
				</div>
				<p class="due-date">📅 Batas: {dueLabel}</p>
				{#if isLate}
					<div class="late-warning">⚠️ Batas waktu telah lewat</div>
				{/if}
			</div>
			<div class="header-right">
				<Badge variant={formattedStatus.variant}>{formattedStatus.text}</Badge>
			</div>
		</div>

		<!-- Description -->
		{#if assignment.description}
			<Card padding="lg">
				<h3 class="section-heading">Deskripsi</h3>
				<div class="description">{assignment.description}</div>
			</Card>
		{/if}

		<!-- Submission Result -->
		{#if submitted || (submission && submission.status !== 'draft')}
			<Card padding="lg">
				<div class="result-header">
					<span class="result-icon">✅</span>
					<h3 class="section-heading" style="margin:0">Submission Berhasil</h3>
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
							<span class="grade-pct" style="color: {submission.score / submission.max_score >= 0.8 ? '#22c55e' : submission.score / submission.max_score >= 0.6 ? '#f1c40f' : '#ef4444'}">
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
			</Card>
		{/if}

		<!-- Submit Form (show if not yet submitted) -->
		{#if canSubmit && (!submission || submission.status === 'draft')}
			<Card padding="lg">
				<h3 class="section-heading">Kumpulkan Tugas</h3>

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

				<!-- Code execution for code-type assignments -->
				{#if assignment.submission_type === 'code'}
					<div class="code-actions">
						<Button onclick={handleRun} disabled={running || !submissionText.trim()} variant="secondary">
							{running ? 'Menjalankan...' : '▶️ Jalankan Kode'}
						</Button>
					</div>

					{#if runError}
						<div class="run-error">
							<strong>Error:</strong> {runError}
						</div>
					{/if}

					{#if runResult}
						<div class="run-output">
							<div class="run-output-header">
								<span>Output</span>
								<Badge variant={runResult.run?.code === 0 ? 'success' : 'danger'}>
									Exit code: {runResult.run?.code ?? 'N/A'}
								</Badge>
							</div>
							<pre class="run-stdout">{runResult.run?.stdout || '(empty)'}</pre>
							{#if runResult.run?.stderr}
								<div class="run-stderr-label">stderr:</div>
								<pre class="run-stderr">{runResult.run.stderr}</pre>
							{/if}
							<div class="run-meta">
								CPU: {runResult.run?.cpu_time ?? 0}ms &middot; Memory: {Math.round((runResult.run?.memory ?? 0) / 1024)}KB
							</div>
						</div>
					{/if}
				{/if}

				{#if submitError}
					<div class="submit-error">{submitError}</div>
				{/if}

				<div class="form-actions">
					<Button onclick={handleSubmit} disabled={isSubmitting}>
						{uploading ? 'Mengupload...' : submitting ? 'Mengumpulkan...' : 'Kumpulkan Tugas'}
					</Button>
				</div>
			</Card>
		{:else if !canSubmit && !submission}
			<Card padding="lg">
				<div class="expired-card">
					<span class="expired-icon">🔒</span>
					<h3 class="section-heading" style="text-align:center; margin-bottom:8px">Batas Waktu Habis</h3>
					<p>Tidak bisa mengumpulkan tugas karena batas waktu telah lewat.</p>
				</div>
			</Card>
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
	.error { color: #ef4444; }

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
	.due-date {
		margin: 0;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.late-warning {
		margin-top: 6px;
		padding: 6px 12px;
		background: #ef444422;
		color: #ef4444;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
	}

	.section-heading {
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
		color: #ef4444;
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
		background: #ef444422;
		color: #ef4444;
		border-radius: 8px;
		font-size: 13px;
		margin-bottom: 12px;
	}

	.form-actions { display: flex; gap: 8px; }

	.expired-card { text-align: center; }
	.expired-icon { font-size: 48px; display: block; margin-bottom: 12px; text-align: center; }
	.expired-card p { color: var(--text-secondary); font-size: 14px; margin: 0; }

	@media (max-width: 640px) {
		.assignment-page { padding: 16px 12px 48px; }
		.header { flex-direction: column; gap: 12px; }
		.header-left h1 { font-size: 20px; }
		.result-meta { flex-direction: column; gap: 6px; }
		.grade-result { flex-wrap: wrap; }
		.dropzone { padding: 24px 16px; }
	}

	@media (max-width: 480px) {
		.form-actions { flex-direction: column; }
	}

	/* Code execution */
	.code-actions { margin-top: 12px; }
	.run-error { margin-top: 8px; padding: 10px 14px; background: #ef444422; color: #ef4444; border-radius: 8px; font-size: 13px; }
	.run-output { margin-top: 12px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
	.run-output-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--surface); border-bottom: 1px solid var(--border); font-weight: 600; font-size: 13px; }
	.run-stdout, .run-stderr { padding: 12px; margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-break: break-all; max-height: 300px; overflow-y: auto; background: var(--bg); }
	.run-stderr { background: #ef444408; }
	.run-stderr-label { padding: 8px 12px 0; font-size: 12px; font-weight: 600; color: #ef4444; }
	.run-meta { padding: 6px 12px; font-size: 11px; color: var(--text-secondary); border-top: 1px solid var(--border); background: var(--surface); }
</style>

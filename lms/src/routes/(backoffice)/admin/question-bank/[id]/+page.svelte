<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		Button, Badge, Modal, Input, Textarea, Select, Alert, Skeleton
	} from '$lib/components/ui';

	interface Question {
		id: string;
		course_offering_id: string;
		type: string;
		question: string;
		options: string | null;
		code_template: string | null;
		test_cases: string | null;
		difficulty: string;
		tags: string | null;
		explanation: string | null;
		points: number;
		status: string;
		created_at: string;
		updated_at: string;
		tenant_id: string | null;
	}

	let q = $state<Question | null>(null);
	let offerings = $state<{ id: string; name: string; code: string }[]>([]);
	let loading = $state(true);
	let error = $state('');
	let editMode = $state(false);
	let previewMode = $state(false);

	// Edit form
	let formType = $state('multiple_choice');
	let formQuestion = $state('');
	let formOptions = $state('[""]');
	let formCodeTemplate = $state('');
	let formTestCases = $state('[]');
	let formDifficulty = $state('medium');
	let formTags = $state('');
	let formExplanation = $state('');
	let formPoints = $state('1');
	let formStatus = $state('draft');
	let formOffering = $state('');
	let submitting = $state(false);
	let formError = $state('');
	let formSuccess = $state('');

	let deleteConfirm = $state(false);

	const id = $derived($page.url.pathname.split('/').pop() || '');

	const typeLabelMap: Record<string, string> = {
		multiple_choice: 'Pilihan Ganda',
		essay: 'Essay',
		coding: 'Coding',
	};
	const difficultyBadgeMap: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
		easy: 'success',
		medium: 'warning',
		hard: 'danger',
	};
	const statusBadgeMap: Record<string, 'default' | 'warning' | 'success'> = {
		draft: 'warning',
		published: 'success',
	};
	const typeFormOptions = [
		{ value: 'multiple_choice', label: 'Pilihan Ganda' },
		{ value: 'essay', label: 'Essay' },
		{ value: 'coding', label: 'Coding' },
	];
	const difficultyFormOptions = [
		{ value: 'easy', label: 'Easy' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'hard', label: 'Hard' },
	];
	const statusFormOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
	];

	$effect(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const [qRes, offRes] = await Promise.all([
				fetch(`/api/admin/question-bank/${id}`),
				fetch(`/api/admin/course-offerings`),
			]);
			const qJson = await qRes.json();
			if (qJson.success) {
				q = qJson.data;
			} else {
				error = qJson.error || 'Soal tidak ditemukan';
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

	function startEdit() {
		if (!q) return;
		editMode = true;
		previewMode = false;
		formType = q.type;
		formQuestion = q.question;
		formOptions = q.options || '[""]';
		formCodeTemplate = q.code_template || '';
		formTestCases = q.test_cases || '[]';
		formDifficulty = q.difficulty;
		formTags = q.tags || '';
		formExplanation = q.explanation || '';
		formPoints = String(q.points);
		formStatus = q.status;
		formOffering = q.course_offering_id || '';
		formError = '';
		formSuccess = '';
	}

	function cancelEdit() {
		editMode = false;
		formError = '';
		formSuccess = '';
	}

	function togglePreview() {
		previewMode = !previewMode;
	}

	function parseOptions(raw: string): string[] {
		try { const p = JSON.parse(raw); return Array.isArray(p) ? p : ['']; }
		catch { return ['']; }
	}

	function parseTestCases(raw: string): any[] {
		try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
		catch { return []; }
	}

	async function submitForm() {
		if (!formQuestion.trim()) {
			formError = 'Soal wajib diisi';
			return;
		}
		if (formType === 'multiple_choice') {
			const opts = parseOptions(formOptions);
			if (opts.length < 2 || opts.some(o => !o.trim())) {
				formError = 'Pilihan ganda minimal 2 opsi dan tidak boleh kosong';
				return;
			}
		}
		submitting = true;
		formError = '';
		formSuccess = '';

		const body: Record<string, unknown> = {
			type: formType,
			question: formQuestion.trim(),
			options: formType === 'multiple_choice' ? parseOptions(formOptions) : null,
			code_template: formType === 'coding' ? formCodeTemplate : null,
			test_cases: formType === 'coding' ? parseTestCases(formTestCases) : null,
			difficulty: formDifficulty,
			tags: formTags || null,
			explanation: formExplanation || null,
			points: formPoints,
			status: formStatus,
			course_offering_id: formOffering || null,
		};

		try {
			const res = await fetch(`/api/admin/question-bank/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				q = json.data;
				formSuccess = 'Soal berhasil diperbarui';
				editMode = false;
			} else {
				formError = json.error || 'Gagal menyimpan';
			}
		} catch {
			formError = 'Gagal terhubung ke server';
		} finally {
			submitting = false;
		}
	}

	async function doDelete() {
		try {
			const res = await fetch(`/api/admin/question-bank/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				window.location.href = '/admin/question-bank';
			} else {
				error = json.error || 'Gagal menghapus';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
		deleteConfirm = false;
	}

	function formatDate(d: string) {
		try {
			return new Date(d + 'Z').toLocaleDateString('id-ID', {
				year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
			});
		} catch { return d; }
	}

	function capitalize(s: string) {
		return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
	}

	let offeringName = $derived(
		q ? (offerings.find(o => o.id === q?.course_offering_id)?.name || q.course_offering_id) : ''
	);

	// Preview state
	let previewAnswer = $state('');
	let previewFeedback = $state<{ correct: boolean; explanation: string } | null>(null);

	function checkPreview() {
		if (!q) return;
		if (q.type === 'multiple_choice') {
			const opts = parseOptions(formOptions || q.options || '[""]');
			const correct = previewAnswer === opts[0];
			previewFeedback = { correct, explanation: correct ? '✅ Jawaban benar!' : '❌ Jawaban salah. Jawaban benar: ' + opts[0] };
		} else if (q.type === 'essay') {
			previewFeedback = { correct: true, explanation: 'Jawaban essay tidak otomatis diperiksa.' };
		} else {
			previewFeedback = { correct: true, explanation: 'Jawaban coding diperiksa oleh sistem.' };
		}
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>${t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<a href="/admin/question-bank" class="back-link">← Kembali ke Bank Soal</a>
	</div>

	{#if loading}
		<Skeleton variant="card" count={3} />
	{:else if error}
		<Alert variant="error">{error}</Alert>
	{:else if q}
		<!-- Action Bar -->
		<div class="action-bar">
			<div class="action-left">
				<h1>Detail Soal</h1>
			</div>
			<div class="action-right">
				<Button variant="secondary" onclick={togglePreview}>
					{previewMode ? 'Tutup Preview' : '👁️ Preview'}
				</Button>
				{#if !editMode}
					<Button onclick={startEdit}>✏️ Edit</Button>
					<Button variant="danger" onclick={() => deleteConfirm = true}>🗑️ Hapus</Button>
				{/if}
			</div>
		</div>

		{#if formSuccess}
			<Alert variant="success">{formSuccess}</Alert>
		{/if}

		<!-- Preview Mode -->
		{#if previewMode}
			<div class="preview-section">
				<h2>👁️ Preview Soal (Tampilan Siswa)</h2>
				<div class="preview-card">
					<div class="preview-question">
						<p class="preview-question-text">{editMode ? formQuestion : q.question}</p>
					</div>

					{#if (editMode ? formType : q.type) === 'multiple_choice'}
						<div class="preview-options">
							{#each parseOptions(editMode ? formOptions : (q.options || '[""]')) as opt, i}
								<label class="preview-option">
									<input type="radio" name="preview-answer" value={opt} bind:group={previewAnswer} />
									<span>{opt}</span>
								</label>
							{/each}
						</div>
					{:else if (editMode ? formType : q.type) === 'essay'}
						<Textarea placeholder="Tulis jawaban di sini..." bind:value={previewAnswer} rows={4} />
					{:else}
						<div class="preview-coding">
							{#if (editMode ? formCodeTemplate : (q.code_template || ''))}
								<pre class="code-block">{editMode ? formCodeTemplate : q.code_template}</pre>
							{/if}
							<Textarea placeholder="Tulis kode di sini..." bind:value={previewAnswer} rows={6} />
						</div>
					{/if}

					<Button onclick={checkPreview}>Periksa Jawaban</Button>

					{#if previewFeedback}
						<div class="preview-feedback" class:correct={previewFeedback.correct} class:incorrect={!previewFeedback.correct}>
							<p class="feedback-result">{previewFeedback.correct ? '✅ Benar!' : '❌ Salah'}</p>
							{#if editMode}
								<p class="feedback-explain">{formExplanation || 'Tidak ada penjelasan'}</p>
							{:else}
								<p class="feedback-explain">{q.explanation || previewFeedback.explanation}</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Detail View -->
		{#if !previewMode}
			{#if editMode}
				<!-- Edit Form -->
				<div class="detail-section">
					<div class="edit-form">
						{#if formError}
							<Alert variant="danger">{formError}</Alert>
						{/if}
						<Select label="Course Offering" options={offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` }))} bind:value={formOffering} />
						<Select label="Tipe Soal" options={typeFormOptions} bind:value={formType} />
						<Textarea label="Soal" bind:value={formQuestion} placeholder="Tulis soal di sini..." rows={4} />
						<Select label="Tingkat Kesulitan" options={difficultyFormOptions} bind:value={formDifficulty} />
						<Input label="Tags (koma, pisah)" bind:value={formTags} placeholder="tag1, tag2" />
						<Input label="Nilai" type="number" bind:value={formPoints} />
						<Select label="Status" options={statusFormOptions} bind:value={formStatus} />
						<Textarea label="Penjelasan" bind:value={formExplanation} placeholder="Penjelasan jawaban..." rows={3} />

						{#if formType === 'multiple_choice'}
							<div class="field">
								<label class="field-label">Opsi Jawaban (JSON Array)</label>
								<Textarea bind:value={formOptions} rows={4} placeholder='["Opsi A", "Opsi B", "Opsi C"]' />
								<p class="field-hint">Format JSON array. Opsi pertama = jawaban benar.</p>
							</div>
						{/if}

						{#if formType === 'coding'}
							<div class="field">
								<label class="field-label">Code Template</label>
								<Textarea bind:value={formCodeTemplate} rows={6} placeholder="// Kode awal" />
							</div>
							<div class="field">
								<label class="field-label">Test Cases (JSON Array)</label>
								<Textarea bind:value={formTestCases} rows={4} placeholder={JSON.stringify([{input: '...', expected: '...'}])} />
							</div>
						{/if}

						<div class="form-actions">
							<Button variant="secondary" onclick={cancelEdit}>{t('common.cancel')}</Button>
							<Button onclick={submitForm} disabled={submitting} loading={submitting}>Simpan Perubahan</Button>
						</div>
					</div>
				</div>
			{:else}
				<!-- Read-only Detail -->
				<div class="detail-section">
					<div class="detail-grid">
						<div class="detail-field">
							<label class="detail-label">{t('admin.soal')}</label>
							<p class="detail-value question-text">{q.question}</p>
						</div>

						<div class="detail-row">
							<div class="detail-field">
								<label class="detail-label">{t('admin.tipe')}</label>
								<Badge variant="info">{typeLabelMap[q.type] || capitalize(q.type)}</Badge>
							</div>
							<div class="detail-field">
								<label class="detail-label">{t('admin.tingkat')}</label>
								<Badge variant={difficultyBadgeMap[q.difficulty] || 'default'}>{capitalize(q.difficulty)}</Badge>
							</div>
							<div class="detail-field">
								<label class="detail-label">{t('common.status')}</label>
								<Badge variant={statusBadgeMap[q.status] || 'default'}>{capitalize(q.status)}</Badge>
							</div>
							<div class="detail-field">
								<label class="detail-label">{t('admin.nilai')}</label>
								<span class="detail-value">{q.points}</span>
							</div>
						</div>

						<div class="detail-row">
							<div class="detail-field">
								<label class="detail-label">{t('admin.course_offering')}</label>
								<span class="detail-value">{offeringName}</span>
							</div>
							<div class="detail-field">
								<label class="detail-label">Tags</label>
								<span class="detail-value">{q.tags || '—'}</span>
							</div>
						</div>

						{#if q.type === 'multiple_choice' && q.options}
							<div class="detail-field">
								<label class="detail-label">{t('admin.opsi_jawaban')}</label>
								<ol class="options-list">
									{#each parseOptions(q.options) as opt, i}
										<li class:correct-answer={i === 0}>{opt}</li>
									{/each}
								</ol>
							</div>
						{/if}

						{#if q.code_template}
							<div class="detail-field">
								<label class="detail-label">Code Template</label>
								<pre class="code-block">{q.code_template}</pre>
							</div>
						{/if}

						{#if q.test_cases}
							<div class="detail-field">
								<label class="detail-label">Test Cases</label>
								<pre class="code-block">{JSON.stringify(parseTestCases(q.test_cases), null, 2)}</pre>
							</div>
						{/if}

						{#if q.explanation}
							<div class="detail-field">
								<label class="detail-label">Penjelasan</label>
								<p class="detail-value">{q.explanation}</p>
							</div>
						{/if}

						<div class="detail-row timeline">
							<div class="detail-field">
								<label class="detail-label">{t('admin.dibuat')}</label>
								<span class="detail-value">{formatDate(q.created_at)}</span>
							</div>
							<div class="detail-field">
								<label class="detail-label">Diperbarui</label>
								<span class="detail-value">{formatDate(q.updated_at)}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>

<!-- Delete Confirmation -->
{#if deleteConfirm}
	<Modal open={deleteConfirm} title="Hapus Soal?" onclose={() => deleteConfirm = false}>
		<p>Soal yang dihapus tidak dapat dikembalikan.</p>

		{#snippet footer()}
			<Button variant="secondary" onclick={() => deleteConfirm = false}>{t('common.cancel')}</Button>
			<Button variant="danger" onclick={doDelete}>🗑️ Hapus</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.page { max-width: 860px; }

	.page-header { margin-bottom: 20px; }
	.back-link {
		color: var(--accent);
		text-decoration: none;
		font-size: 14px;
	}
	.back-link:hover { text-decoration: underline; }

	.action-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		flex-wrap: wrap;
		gap: 12px;
	}
	.action-bar h1 { font-size: 22px; font-weight: 700; margin: 0; }
	.action-right { display: flex; gap: 8px; }

	.detail-section {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 24px;
	}
	.detail-grid { display: flex; flex-direction: column; gap: 20px; }
	.detail-row {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
	}
	.detail-row.timeline { gap: 40px; }
	.detail-field { flex: 1; min-width: 140px; }
	.detail-label {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: block;
		margin-bottom: 6px;
	}
	.detail-value { font-size: 14px; color: var(--text); }
	.question-text {
		font-size: 16px;
		line-height: 1.6;
		margin: 0;
	}
	.options-list {
		margin: 4px 0 0 20px;
		padding: 0;
	}
	.options-list li {
		padding: 4px 0;
		font-size: 14px;
	}
	.options-list li.correct-answer {
		color: #4ade80;
		font-weight: 600;
	}
	.code-block {
		background: rgba(0,0,0,0.3);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 13px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		overflow-x: auto;
		line-height: 1.5;
	}

	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.field { display: flex; flex-direction: column; gap: 4px; }
	.field-label {
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}
	.field-hint {
		font-size: 11px;
		color: var(--text-secondary);
		margin: 2px 0 0;
	}
	.form-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}

	/* Preview */
	.preview-section {
		margin-bottom: 20px;
	}
	.preview-section h2 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
	}
	.preview-card {
		background: var(--surface);
		border: 2px solid var(--accent-dim);
		border-radius: 12px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.preview-question-text {
		font-size: 16px;
		line-height: 1.6;
		margin: 0;
		font-weight: 500;
	}
	.preview-options {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.preview-option {
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
	.preview-option:hover {
		border-color: var(--accent-dim);
		background: rgba(79, 70, 229, 0.04);
	}
	.preview-option input { accent-color: #4F46E5; }

	.preview-feedback {
		padding: 16px;
		border-radius: 8px;
		border: 1px solid;
	}
	.preview-feedback.correct {
		background: rgba(74, 222, 128, 0.08);
		border-color: rgba(74, 222, 128, 0.3);
	}
	.preview-feedback.incorrect {
		background: rgba(239, 68, 68, 0.08);
		border-color: rgba(239, 68, 68, 0.3);
	}
	.feedback-result {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 4px;
	}
	.feedback-explain {
		font-size: 14px;
		margin: 0;
		opacity: 0.8;
	}
</style>

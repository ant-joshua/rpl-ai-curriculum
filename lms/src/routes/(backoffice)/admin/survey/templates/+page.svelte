<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let loading = $state(true);
	let error = $state('');
	let templates = $state<any[]>([]);
	let surveyTypeFilter = $state('');

	let showForm = $state(false);
	let editingId = $state<string | null>(null);
	let saving = $state(false);

	let formName = $state('');
	let formSurveyType = $state('feedback');
	let formDescription = $state('');

	// Question builder state
	let showQuestionForm = $state(false);
	let editingQuestionId = $state<string | null>(null);
	let selectedTemplateId = $state<string | null>(null);
	let questions = $state<any[]>([]);
	let questionsLoading = $state(false);

	let qFormText = $state('');
	let qFormType = $state('rating');
	let qFormRequired = $state(true);
	let qFormOptions = $state('');
	let qFormSortOrder = $state(0);

	const surveyTypes = ['feedback', 'evaluation', 'poll', 'assessment'];
	const questionTypes = ['rating', 'text', 'choice', 'multiple_choice', 'linear_scale'];

	onMount(() => {
		if (browser) loadTemplates();
	});

	async function loadTemplates() {
		loading = true;
		error = '';
		try {
			const params = surveyTypeFilter ? `?survey_type=${surveyTypeFilter}` : '';
			const res = await fetch('/api/admin/survey/templates' + params);
			const json = await res.json();
			if (json.success) {
				templates = json.data || [];
			} else {
				error = 'Gagal memuat template';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	async function loadQuestions(templateId: string) {
		questionsLoading = true;
		try {
			const res = await fetch(`/api/admin/survey/templates?template_id=${templateId}`);
			// Dedicated questions endpoint — use question list path
			const res2 = await fetch(`/api/admin/survey/templates/${templateId}/questions`);
			// We need a questions list endpoint. Templates endpoint returns questions embedded.
			// Actually let's create one inline: query repo method directly...
			// For now use the pattern: GET all questions via the questions API (no dedicated list route yet)
			// We'll embed questions within templates data instead
		} catch {}
	}

	function resetForm() {
		formName = '';
		formSurveyType = 'feedback';
		formDescription = '';
		editingId = null;
	}

	function resetQForm() {
		qFormText = '';
		qFormType = 'rating';
		qFormRequired = true;
		qFormOptions = '';
		qFormSortOrder = 0;
		editingQuestionId = null;
	}

	function openCreate() {
		resetForm();
		showForm = true;
	}

	function openEdit(t: any) {
		editingId = t.id;
		formName = t.name;
		formSurveyType = t.survey_type || 'feedback';
		formDescription = t.description || '';
		showForm = true;
	}

	function cancelForm() {
		showForm = false;
		resetForm();
	}

	function cancelQForm() {
		showQuestionForm = false;
		resetQForm();
	}

	async function saveTemplate() {
		if (!formName) return;
		saving = true;
		try {
			const payload = { name: formName, surveyType: formSurveyType, description: formDescription || undefined };
			const url = editingId ? `/api/admin/survey/templates/${editingId}` : '/api/admin/survey/templates';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				showForm = false;
				resetForm();
				await loadTemplates();
			} else {
				error = json.error || 'Gagal menyimpan template';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			saving = false;
		}
	}

	async function deleteTemplate(id: string) {
		if (!confirm('Hapus template ini? Semua pertanyaan terkait akan ikut terhapus.')) return;
		try {
			const res = await fetch(`/api/admin/survey/templates/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				if (selectedTemplateId === id) { selectedTemplateId = null; questions = []; }
				await loadTemplates();
			} else {
				error = json.error || 'Gagal menghapus template';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
	}

	// Question operations
	async function openAddQuestion(templateId: string) {
		selectedTemplateId = templateId;
		resetQForm();
		await fetchQuestions(templateId);
		showQuestionForm = true;
	}

	async function fetchQuestions(templateId: string) {
		questionsLoading = true;
		try {
			const res = await fetch(`/api/admin/survey/templates/${templateId}/questions`);
			const json = await res.json();
			// If the endpoint doesn't exist yet, load inline via the template data
			if (json.success) {
				questions = json.data || [];
			} else {
				questions = [];
			}
		} catch {
			questions = [];
		} finally {
			questionsLoading = false;
		}
	}

	async function openEditQuestion(q: any) {
		editingQuestionId = q.id;
		qFormText = q.question_text;
		qFormType = q.question_type;
		qFormRequired = q.required === 1;
		try { qFormOptions = JSON.parse(q.options || '[]').join('\n'); } catch { qFormOptions = ''; }
		qFormSortOrder = q.sort_order || 0;
		showQuestionForm = true;
	}

	async function saveQuestion() {
		if (!qFormText || !selectedTemplateId) return;
		saving = true;
		try {
			const options = qFormOptions ? qFormOptions.split('\n').map((s: string) => s.trim()).filter(Boolean) : undefined;
			const payload: any = {
				templateId: selectedTemplateId,
				questionText: qFormText,
				questionType: qFormType,
				required: qFormRequired ? 1 : 0,
				sortOrder: qFormSortOrder,
			};
			if (options && options.length > 0) payload.options = options;

			const url = editingQuestionId ? `/api/admin/survey/questions/${editingQuestionId}` : '/api/admin/survey/questions';
			const method = editingQuestionId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			const json = await res.json();
			if (json.success) {
				showQuestionForm = false;
				resetQForm();
				if (selectedTemplateId) await fetchQuestions(selectedTemplateId);
			} else {
				error = json.error || 'Gagal menyimpan pertanyaan';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			saving = false;
		}
	}

	async function deleteQuestion(id: string) {
		if (!confirm('Hapus pertanyaan ini?')) return;
		try {
			const res = await fetch(`/api/admin/survey/questions/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success && selectedTemplateId) {
				await fetchQuestions(selectedTemplateId);
			} else {
				error = json.error || 'Gagal menghapus pertanyaan';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
	}

	async function moveQuestion(id: string, dir: number) {
		if (!selectedTemplateId) return;
		const idx = questions.findIndex((q) => q.id === id);
		if (idx < 0) return;
		const newIdx = idx + dir;
		if (newIdx < 0 || newIdx >= questions.length) return;

		const currentOrder = questions[idx].sort_order || 0;
		const swapOrder = questions[newIdx].sort_order || 0;

		await Promise.all([
			fetch(`/api/admin/survey/questions/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sortOrder: swapOrder }),
			}),
			fetch(`/api/admin/survey/questions/${questions[newIdx].id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sortOrder: currentOrder }),
			}),
		]);

		await fetchQuestions(selectedTemplateId);
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
		catch { return d; }
	}

	function questionTypeLabel(t: string): string {
		switch (t) {
			case 'rating': return '⭐ Rating';
			case 'text': return '📝 Text';
			case 'choice': return '🔘 Pilihan';
			case 'multiple_choice': return '☑️ Multi Pilihan';
			case 'linear_scale': return '📊 Skala';
			default: return t;
		}
	}
</script>

<svelte:head>
	<title>Survey Templates — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Survey Templates</h1>
			<p class="subtitle">Kelola template survei dan pertanyaan</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadTemplates}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Template</button>
		</div>
	</div>

	<!-- Type filter -->
	<div class="filter-bar">
		<button class="filter-btn" class:active={surveyTypeFilter === ''} onclick={() => { surveyTypeFilter = ''; loadTemplates(); }}>
			All
		</button>
		{#each surveyTypes as t}
			<button class="filter-btn" class:active={surveyTypeFilter === t} onclick={() => { surveyTypeFilter = t; loadTemplates(); }}>
				{t}
			</button>
		{/each}
	</div>

	{#if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadTemplates}>Coba Lagi</button>
		</div>
	{/if}

	<!-- Template Form Modal -->
	{#if showForm}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={cancelForm}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>{editingId ? 'Edit Template' : 'Buat Template Baru'}</h3>
					<button class="btn-close" onclick={cancelForm}>✕</button>
				</div>
				<div class="modal-body">
					<div class="form-row">
						<label class="form-label">Nama Template</label>
						<input class="form-input" bind:value={formName} placeholder="e.g. Course Feedback" />
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">Tipe Survei</label>
							<select class="form-input" bind:value={formSurveyType}>
								{#each surveyTypes as st}
									<option value={st}>{st}</option>
								{/each}
							</select>
						</div>
					</div>
					<div class="form-row">
						<label class="form-label">Deskripsi (opsional)</label>
						<textarea class="form-textarea" bind:value={formDescription} rows="3" placeholder="Deskripsi template..."></textarea>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={cancelForm}>Batal</button>
					<button class="btn-primary" onclick={saveTemplate} disabled={saving || !formName}>
						{saving ? 'Menyimpan...' : editingId ? 'Update' : 'Buat Template'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Question Form Modal -->
	{#if showQuestionForm && selectedTemplateId}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={cancelQForm}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="modal modal-wide" onclick={(e) => e.stopPropagation()}>
				<div class="modal-header">
					<h3>{editingQuestionId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</h3>
					<button class="btn-close" onclick={cancelQForm}>✕</button>
				</div>
				<div class="modal-body">
					<div class="form-row">
						<label class="form-label">Pertanyaan</label>
						<input class="form-input" bind:value={qFormText} placeholder="e.g. How satisfied are you?" />
					</div>
					<div class="form-row-2col">
						<div>
							<label class="form-label">Tipe Jawaban</label>
							<select class="form-input" bind:value={qFormType} onchange={() => { if (qFormType !== 'choice' && qFormType !== 'multiple_choice') qFormOptions = ''; }}>
								{#each questionTypes as qt}
									<option value={qt}>{questionTypeLabel(qt)}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="form-label">Urutan</label>
							<input class="form-input" type="number" bind:value={qFormSortOrder} />
						</div>
					</div>
					<div class="form-row">
						<label class="form-checkbox">
							<input type="checkbox" bind:checked={qFormRequired} />
							Wajib diisi
						</label>
					</div>
					{#if qFormType === 'choice' || qFormType === 'multiple_choice'}
						<div class="form-row">
							<label class="form-label">Pilihan (satu per baris)</label>
							<textarea class="form-textarea" bind:value={qFormOptions} rows="4" placeholder="Option 1&#10;Option 2&#10;Option 3"></textarea>
						</div>
					{/if}
				</div>
				<div class="modal-footer">
					<button class="btn-secondary" onclick={cancelQForm}>Batal</button>
					<button class="btn-primary" onclick={saveQuestion} disabled={saving || !qFormText}>
						{saving ? 'Menyimpan...' : editingQuestionId ? 'Update' : 'Tambah'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Templates + Questions -->
	{#if loading}
		<div class="loading">Memuat template...</div>
	{:else if templates.length === 0}
		<div class="empty-state">
			<p>Belum ada template survei</p>
			<button class="btn-primary" onclick={openCreate}>Buat Template Pertama</button>
		</div>
	{:else}
		<div class="templates-list">
			{#each templates as t}
				<div class="template-card">
					<div class="template-card-header">
						<div>
							<h4 class="t-name">{t.name}</h4>
							<p class="t-meta">{t.survey_type || 'feedback'}{t.description ? ` · ${t.description}` : ''}</p>
						</div>
						<div class="t-actions">
							<button class="btn-small" onclick={() => openAddQuestion(t.id)}>+ Pertanyaan</button>
							<button class="btn-small" onclick={() => openEdit(t)}>Edit</button>
							<button class="btn-small btn-danger" onclick={() => deleteTemplate(t.id)}>Hapus</button>
						</div>
					</div>

					{#if selectedTemplateId === t.id}
						<div class="questions-section">
							<div class="q-header">
								<h5>Pertanyaan</h5>
							</div>
							{#if questionsLoading}
								<div class="loading">Memuat pertanyaan...</div>
							{:else if questions.length === 0}
								<div class="empty-state small">
									<p>Belum ada pertanyaan</p>
									<button class="btn-small" onclick={() => { resetQForm(); showQuestionForm = true; }}>+ Tambah</button>
								</div>
							{:else}
								<div class="question-list">
									{#each questions as q, i}
										<div class="question-row">
											<div class="q-info">
												<span class="q-num">{i + 1}.</span>
												<span class="q-text">{q.question_text}</span>
												<span class="q-type-badge">{questionTypeLabel(q.question_type)}</span>
												{#if q.required === 1}
													<span class="q-required">*</span>
												{/if}
											</div>
											<div class="q-actions">
												<button class="btn-icon" onclick={() => moveQuestion(q.id, -1)} disabled={i === 0}>↑</button>
												<button class="btn-icon" onclick={() => moveQuestion(q.id, 1)} disabled={i === questions.length - 1}>↓</button>
												<button class="btn-icon" onclick={() => openEditQuestion(q)}>✏️</button>
												<button class="btn-icon btn-icon-danger" onclick={() => deleteQuestion(q.id)}>🗑️</button>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}

					<div class="template-card-footer">
						<span class="t-date">{formatDate(t.created_at)}</span>
						{#if selectedTemplateId === t.id}
							<button class="btn-text" onclick={() => { selectedTemplateId = null; questions = []; }}>Tutup</button>
						{:else}
							<button class="btn-text" onclick={() => { selectedTemplateId = t.id; fetchQuestions(t.id); }}>Lihat Pertanyaan</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-small { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 11px; cursor: pointer; }
	.btn-small:hover { background: var(--surface-hover); }
	.btn-danger { color: #ef4444; border-color: rgba(239,68,68,0.3); }
	.btn-text { background: none; border: none; color: var(--accent); font-size: 12px; cursor: pointer; padding: 0; }
	.btn-text:hover { text-decoration: underline; }
	.btn-icon { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 2px 6px; cursor: pointer; font-size: 12px; line-height: 1; }
	.btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
	.btn-icon-danger:hover { border-color: #ef4444; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.filter-bar { display: flex; gap: 6px; margin-bottom: 20px; flex-wrap: wrap; }
	.filter-btn {
		padding: 6px 14px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--surface);
		color: var(--text-secondary);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
	}
	.filter-btn:hover { background: var(--bg-secondary); color: var(--text); }
	.filter-btn.active { background: var(--accent-dim); color: var(--accent); border-color: var(--accent); }

	/* Modal */
	.modal-overlay {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200;
		display: flex; align-items: center; justify-content: center;
		backdrop-filter: blur(4px);
	}
	.modal {
		background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
		width: 540px; max-width: 95vw; max-height: 85vh; overflow-y: auto;
	}
	.modal-wide { width: 640px; }
	.modal-header {
		display: flex; justify-content: space-between; align-items: center;
		padding: 18px 20px; border-bottom: 1px solid var(--border);
	}
	.modal-header h3 { margin: 0; font-size: 16px; }
	.btn-close { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; }
	.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; }

	.form-row { display: flex; flex-direction: column; gap: 6px; }
	.form-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
	.form-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }
	.form-input, .form-textarea {
		width: 100%; padding: 10px 12px; font-size: 13px;
		background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px;
		color: var(--text); outline: none; font-family: inherit; box-sizing: border-box;
	}
	.form-input:focus, .form-textarea:focus { border-color: var(--accent); }
	textarea.form-textarea { resize: vertical; }
	.form-checkbox { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text); cursor: pointer; }

	/* Templates */
	.templates-list { display: flex; flex-direction: column; gap: 14px; }
	.template-card {
		background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
		overflow: hidden; transition: border-color 0.15s;
	}
	.template-card:hover { border-color: var(--accent); }
	.template-card-header {
		display: flex; justify-content: space-between; align-items: flex-start;
		padding: 16px 18px; border-bottom: 1px solid var(--border);
	}
	.t-name { margin: 0; font-size: 15px; font-weight: 600; }
	.t-meta { margin: 2px 0 0; font-size: 12px; color: var(--text-secondary); }
	.t-actions { display: flex; gap: 6px; flex-wrap: wrap; }
	.template-card-footer {
		display: flex; justify-content: space-between; align-items: center;
		padding: 10px 18px; background: var(--bg-secondary);
	}
	.t-date { font-size: 11px; color: var(--text-secondary); }

	/* Questions section */
	.questions-section {
		border-bottom: 1px solid var(--border);
		padding: 14px 18px;
	}
	.q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
	.q-header h5 { margin: 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-secondary); }

	.question-list { display: flex; flex-direction: column; gap: 6px; }
	.question-row {
		display: flex; justify-content: space-between; align-items: center;
		padding: 8px 10px; border-radius: 8px;
		background: var(--bg-secondary); gap: 8px;
	}
	.q-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.q-num { font-weight: 600; font-size: 13px; color: var(--accent); min-width: 20px; }
	.q-text { font-size: 13px; font-weight: 500; }
	.q-type-badge {
		padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;
		background: rgba(98,102,109,0.15); color: #8a8f98; text-transform: uppercase;
	}
	.q-required { color: #ef4444; font-weight: 700; }
	.q-actions { display: flex; gap: 4px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 20px; margin-bottom: 16px; }
	.error-msg { color: #ef4444; margin-bottom: 8px; font-size: 13px; }
	.empty-state { text-align: center; padding: 40px; color: var(--text-secondary); }
	.empty-state.small { padding: 20px; }
	.empty-state p { margin-bottom: 12px; }
</style>

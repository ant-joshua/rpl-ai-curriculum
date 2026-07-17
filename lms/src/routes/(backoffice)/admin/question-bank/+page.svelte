<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import {
		Button, Badge, Modal, Input, Textarea, Select, Alert, Loading, EmptyState
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

	interface Offering {
		id: string;
		name: string;
		code: string;
	}

	let questions = $state<Question[]>([]);
	let offerings = $state<Offering[]>([]);
	let loading = $state(true);
	let error = $state('');

	// Filters
	let filterType = $state('');
	let filterDifficulty = $state('');
	let filterOffering = $state('');
	let filterStatus = $state('');
	let searchText = $state('');

	// Pagination
	let page = $state(1);
	let total = $state(0);
	let totalPages = $state(1);
	const limit = 20;

	// Form
	let showModal = $state(false);
	let editId = $state<string | null>(null);
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

	// Delete confirm
	let deleteId = $state<string | null>(null);

	const typeOptions = [
		{ value: '', label: 'Semua Tipe' },
		{ value: 'multiple_choice', label: 'Pilihan Ganda' },
		{ value: 'essay', label: 'Essay' },
		{ value: 'coding', label: 'Coding' },
	];
	const difficultyOptions = [
		{ value: '', label: 'Semua Tingkat' },
		{ value: 'easy', label: 'Easy' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'hard', label: 'Hard' },
	];
	const statusOptions = [
		{ value: '', label: 'Semua Status' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
	];
	const difficultyFormOptions = [
		{ value: 'easy', label: 'Easy' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'hard', label: 'Hard' },
	];
	const typeFormOptions = [
		{ value: 'multiple_choice', label: 'Pilihan Ganda' },
		{ value: 'essay', label: 'Essay' },
		{ value: 'coding', label: 'Coding' },
	];
	const statusFormOptions = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'published', label: 'Published' },
	];

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

	$effect(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = '';
		try {
			const params = new URLSearchParams();
			if (filterType) params.set('type', filterType);
			if (filterDifficulty) params.set('difficulty', filterDifficulty);
			if (filterOffering) params.set('course_offering_id', filterOffering);
			if (filterStatus) params.set('status', filterStatus);
			if (searchText) params.set('search', searchText);
			params.set('page', String(page));
			params.set('limit', String(limit));

			const [qRes, offRes] = await Promise.all([
				fetch(`/api/admin/question-bank?${params}`),
				fetch(`/api/admin/course-offerings`),
			]);
			const qJson = await qRes.json();
			if (qJson.success) {
				questions = qJson.data || [];
				total = qJson.pagination?.total || qJson.total || 0;
				totalPages = qJson.pagination?.totalPages || 1;
			} else {
				error = qJson.error || 'Gagal memuat data';
			}
			const offJson = await offRes.json();
			if (offJson.success) {
				offerings = offJson.offerings || offJson.data || [];
			}
		} catch {
			error = 'Gagal terhubung ke server';
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		page = 1;
		loadData();
	}

	function truncate(text: string, len = 80): string {
		return text.length > len ? text.slice(0, len) + '…' : text;
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

	function openAdd() {
		editId = null;
		formType = 'multiple_choice';
		formQuestion = '';
		formOptions = '[""]';
		formCodeTemplate = '';
		formTestCases = '[]';
		formDifficulty = 'medium';
		formTags = '';
		formExplanation = '';
		formPoints = '1';
		formStatus = 'draft';
		formOffering = '';
		formError = '';
		formSuccess = '';
		showModal = true;
	}

	async function openEdit(q: Question) {
		editId = q.id;
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
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		editId = null;
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
			const url = editId
				? `/api/admin/question-bank/${editId}`
				: '/api/admin/question-bank';
			const method = editId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				formSuccess = editId ? 'Soal berhasil diperbarui' : 'Soal berhasil dibuat';
				closeModal();
				loadData();
			} else {
				formError = json.error || 'Gagal menyimpan soal';
			}
		} catch {
			formError = 'Gagal terhubung ke server';
		} finally {
			submitting = false;
		}
	}

	function confirmDelete(id: string) {
		deleteId = id;
	}

	async function doDelete() {
		if (!deleteId) return;
		try {
			const res = await fetch(`/api/admin/question-bank/${deleteId}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				questions = questions.filter(q => q.id !== deleteId);
				total--;
			} else {
				error = json.error || 'Gagal menghapus';
			}
		} catch {
			error = 'Gagal terhubung ke server';
		}
		deleteId = null;
	}

	let offeringOptions = $derived(
		offerings.map(o => ({ value: o.id, label: `${o.name} (${o.code})` }))
	);
	let offeringFilterOptions = $derived([
		{ value: '', label: 'Semua Kelas' },
		...offeringOptions,
	]);
</script>

<svelte:head>
	<title>Bank Soal — Admin</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>🗂️ Bank Soal</h1>
			<p class="page-desc">Kelola soal untuk kuis, ujian, dan latihan</p>
		</div>
		<Button onclick={openAdd}>➕ Buat Soal Baru</Button>
	</div>

	{#if error}
		<Alert variant="error">{error}</Alert>
	{/if}

	<!-- Filters -->
	<div class="filter-bar">
		<div class="filter-row">
			<Select options={typeOptions} bind:value={filterType} />
			<Select options={difficultyOptions} bind:value={filterDifficulty} />
			<Select options={offeringFilterOptions} bind:value={filterOffering} />
			<Select options={statusOptions} bind:value={filterStatus} />
			<Input placeholder="Cari soal atau tag..." bind:value={searchText} />
			<Button onclick={applyFilters}>Cari</Button>
		</div>
		<span class="filter-count">{total} soal</span>
	</div>

	<!-- Table -->
	{#if loading}
		<Loading />
	{:else if questions.length === 0}
		<EmptyState
			title="Belum Ada Soal"
			description="Belum ada soal di bank soal. Klik 'Buat Soal Baru' untuk memulai."
		/>
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead>
					<tr>
						<th>Soal</th>
						<th>Tipe</th>
						<th>Tingkat</th>
						<th>Status</th>
						<th>Nilai</th>
						<th>Dibuat</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{#each questions as q (q.id)}
						<tr>
							<td class="cell-question">
								<a href="/admin/question-bank/{q.id}" class="question-link">{truncate(q.question)}</a>
								{#if q.tags}
								{@const tagList = q.tags.split(',').filter(Boolean).map(t => t.trim())}
								<div class="tags">
									{#each tagList as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							{/if}
							</td>
							<td><Badge variant="info">{typeLabelMap[q.type] || capitalize(q.type)}</Badge></td>
							<td><Badge variant={difficultyBadgeMap[q.difficulty] || 'default'}>{capitalize(q.difficulty)}</Badge></td>
							<td><Badge variant={statusBadgeMap[q.status] || 'default'}>{capitalize(q.status)}</Badge></td>
							<td class="cell-points">{q.points}</td>
							<td class="cell-date">{formatDate(q.created_at)}</td>
							<td class="cell-actions">
								<Button variant="ghost" onclick={() => openEdit(q)} title="Edit">✏️</Button>
								<Button variant="ghost" onclick={() => confirmDelete(q.id)} title="Hapus">🗑️</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="pagination">
				<Button variant="secondary" disabled={page <= 1} onclick={() => { page--; loadData(); }}>← Prev</Button>
				<span class="page-info">Halaman {page} dari {totalPages} ({total} soal)</span>
				<Button variant="secondary" disabled={page >= totalPages} onclick={() => { page++; loadData(); }}>Next →</Button>
			</div>
		{/if}
	{/if}
</div>

<!-- Add/Edit Modal -->
{#if showModal}
	<Modal open={showModal} title={editId ? 'Edit Soal' : 'Buat Soal Baru'} onclose={closeModal}>
		{#if formError}
			<Alert variant="danger">{formError}</Alert>
		{/if}
		{#if formSuccess}
			<Alert variant="success">{formSuccess}</Alert>
		{/if}

		<Select label="Course Offering" options={offeringOptions} bind:value={formOffering} />
		<Select label="Tipe Soal" options={typeFormOptions} bind:value={formType} />
		<Textarea label="Soal" bind:value={formQuestion} placeholder="Tulis soal di sini..." rows={4} />
		<Select label="Tingkat Kesulitan" options={difficultyFormOptions} bind:value={formDifficulty} />
		<Input label="Tags (koma, pisah)" bind:value={formTags} placeholder="tag1, tag2" />
		<Input label="Nilai" type="number" bind:value={formPoints} />
		<Select label="Status" options={statusFormOptions} bind:value={formStatus} />
		<Textarea label="Penjelasan" bind:value={formExplanation} placeholder="Penjelasan jawaban..." rows={3} />

		{#if formType === 'multiple_choice'}
			<div class="options-editor">
				<label class="form-label">Opsi Jawaban (JSON Array)</label>
				<Textarea bind:value={formOptions} rows={4} placeholder='["Opsi A", "Opsi B", "Opsi C"]' />
				<p class="form-hint">Format JSON array. Opsi pertama adalah jawaban benar.</p>
			</div>
		{/if}

		{#if formType === 'coding'}
			<div class="coding-fields">
				<Textarea label="Code Template" bind:value={formCodeTemplate} rows={6} placeholder="// Kode awal untuk siswa" />
				<div class="test-cases-editor">
					<label class="form-label">Test Cases (JSON Array)</label>
					<Textarea bind:value={formTestCases} rows={4} placeholder="e.g. input, expected" />
					<p class="form-hint">JSON array: input, expected pairs</p>
				</div>
			</div>
		{/if}

		{#snippet footer()}
			<Button variant="secondary" onclick={closeModal} disabled={submitting}>Batal</Button>
			<Button onclick={submitForm} disabled={submitting} loading={submitting}>
				{editId ? 'Simpan Perubahan' : 'Simpan Soal'}
			</Button>
		{/snippet}
	</Modal>
{/if}

<!-- Delete Confirmation -->
{#if deleteId}
	<Modal open={!!deleteId} title="Hapus Soal?" onclose={() => deleteId = null}>
		<p>Soal yang dihapus tidak dapat dikembalikan.</p>

		{#snippet footer()}
			<Button variant="secondary" onclick={() => deleteId = null}>Batal</Button>
			<Button variant="danger" onclick={doDelete}>🗑️ Hapus</Button>
		{/snippet}
	</Modal>
{/if}

<style>
	.page { max-width: 1100px; }
	h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
	.page-desc { color: var(--text-secondary); font-size: 14px; margin: 0; }

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24px;
	}

	.filter-bar {
		margin-bottom: 20px;
	}
	.filter-row {
		display: flex;
		gap: 10px;
		align-items: flex-end;
		flex-wrap: wrap;
	}
	.filter-row > :global(*) { min-width: 150px; }
	.filter-count {
		font-size: 13px;
		color: var(--text-secondary);
		margin-top: 8px;
		display: block;
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}
	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13.5px;
	}
	.data-table th {
		text-align: left;
		padding: 12px 14px;
		font-size: 11px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--border);
		background: var(--bg-secondary);
		white-space: nowrap;
	}
	.data-table td {
		padding: 12px 14px;
		border-bottom: 1px solid var(--border);
		vertical-align: middle;
	}
	.data-table tr:last-child td { border-bottom: none; }
	.data-table tr:hover { background: rgba(255,255,255,0.02); }

	.cell-question { min-width: 250px; max-width: 350px; }
	.question-link {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
		display: block;
		margin-bottom: 4px;
	}
	.question-link:hover { text-decoration: underline; }

	.tags { display: flex; gap: 4px; flex-wrap: wrap; }
	.tag {
		font-size: 11px;
		background: rgba(94, 106, 210, 0.12);
		color: #7170ff;
		padding: 2px 8px;
		border-radius: 10px;
	}

	.cell-points { text-align: center; font-weight: 600; }
	.cell-date { white-space: nowrap; font-size: 12px; color: var(--text-secondary); }
	.cell-actions { white-space: nowrap; display: flex; gap: 4px; }

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-top: 20px;
	}
	.page-info { font-size: 13px; color: var(--text-secondary); }

	.form-label {
		font-size: 12px;
		color: #8a8f98;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
		margin-bottom: 4px;
		display: block;
	}
	.form-hint {
		font-size: 11px;
		color: var(--text-secondary);
		margin: 4px 0 0;
	}
	.options-editor, .test-cases-editor { margin-top: 8px; }
	.coding-fields { display: flex; flex-direction: column; gap: 12px; }
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, Badge, Card, CardContent, TableHeader, PageHeader, EmptyState, StatCard } from '$lib/components/ui';
import { DataTable } from '$lib/components/ui';
import type { ColumnDef } from '@tanstack/svelte-table';

	let assignments: any[] = $state([]);
	let offerings: any[] = $state([]);
	let lessons: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	// Filters
	let selectedOfferingId = $state('');

	// Create/Edit modal
	let showModal = $state(false);
	let editingId = $state<string | null>(null);
	let form = $state({
		course_offering_id: '',
		lesson_id: '',
		title: '',
		description: '',
		due_date: '',
		max_score: 100,
		submission_type: 'text',
		weight: 0,
		allow_late_submission: false,
		late_penalty_percent: 10,
		status: 'published',
	});
	let submitting = $state(false);
	let submitError = $state('');

	// Submissions panel
	let showSubmissions = $state<string | null>(null);
	let submissions: any[] = $state([]);
	let submissionsLoading = $state(false);

	// Grade modal
	let gradeId = $state<string | null>(null);
	let gradeScore = $state(0);
	let gradeFeedback = $state('');
	let grading = $state(false);

	// Delete confirmation
	let confirmDelete = $state<string | null>(null);

	onMount(() => {
		if (browser) { loadOfferings(); loadData(); }
	});

	async function loadOfferings() {
		try {
			const res = await fetch('/api/admin/course-offerings');
			const json = await res.json();
			if (json.success) offerings = json.data || [];
		} catch {}
	}

	async function loadLessons(offeringId: string) {
		try {
			const res = await fetch(`/api/lessons?course_offering_id=${offeringId}&limit=200`);
			const json = await res.json();
			if (json.success) lessons = json.data || [];
		} catch { lessons = []; }
	}

	async function loadData() {
		loading = true; error = '';
		try {
			const params = new URLSearchParams();
			if (selectedOfferingId) params.set('course_offering_id', selectedOfferingId);
			const res = await fetch(`/api/admin/assignments?${params}&limit=200`);
			const json = await res.json();
			if (json.success) assignments = json.data || [];
			else error = json.error || 'Gagal memuat tugas';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openCreate() {
		editingId = null;
		form = { course_offering_id: selectedOfferingId, lesson_id: '', title: '', description: '', due_date: '', max_score: 100, submission_type: 'text', weight: 0, allow_late_submission: false, late_penalty_percent: 10, status: 'published' };
		submitError = '';
		showModal = true;
		if (form.course_offering_id) loadLessons(form.course_offering_id);
	}

	function openEdit(a: any) {
		editingId = a.id;
		form = {
			course_offering_id: a.course_offering_id,
			lesson_id: a.lesson_id || '',
			title: a.title || '',
			description: a.description || '',
			due_date: a.due_date ? a.due_date.slice(0, 16) : '',
			max_score: a.max_score || 100,
			submission_type: a.submission_type || 'text',
			weight: a.weight || 0,
			allow_late_submission: !!a.allow_late_submission,
			late_penalty_percent: a.late_penalty_percent || 10,
			status: a.status || 'published',
		};
		submitError = '';
		showModal = true;
		if (form.course_offering_id) loadLessons(form.course_offering_id);
	}

	function closeModal() { showModal = false; }

	async function handleSubmit() {
		if (!form.title.trim() || !form.course_offering_id) {
			submitError = 'Judul dan kursus wajib diisi';
			return;
		}
		submitting = true; submitError = '';
		try {
			const url = editingId ? `/api/admin/assignments/${editingId}` : '/api/admin/assignments';
			const method = editingId ? 'PUT' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...form,
					allow_late_submission: form.allow_late_submission ? 1 : 0,
				}),
			});
			const json = await res.json();
			if (json.success) { closeModal(); loadData(); }
			else submitError = json.error || 'Gagal menyimpan';
		} catch { submitError = 'Network error'; }
		finally { submitting = false; }
	}

	async function handleDelete(id: string) {
		try {
			const res = await fetch(`/api/admin/assignments/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) { confirmDelete = null; loadData(); }
			else alert(json.error || 'Gagal menghapus');
		} catch { alert('Network error'); }
	}

	async function loadSubmissions(assignmentId: string) {
		showSubmissions = showSubmissions === assignmentId ? null : assignmentId;
		if (showSubmissions !== assignmentId) return;
		submissionsLoading = true;
		try {
			const res = await fetch(`/api/admin/assignment-submissions?assignment_id=${assignmentId}&limit=200`);
			const json = await res.json();
			if (json.success) submissions = json.data || [];
		} catch { submissions = []; }
		finally { submissionsLoading = false; }
	}

	async function handleGrade(submissionId: string) {
		grading = true;
		try {
			const res = await fetch(`/api/admin/submissions/${submissionId}/grade`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ score: gradeScore, feedback: gradeFeedback }),
			});
			const json = await res.json();
			if (json.success) {
				gradeId = null;
				if (showSubmissions) loadSubmissions(showSubmissions);
			} else alert(json.error || 'Gagal menilai');
		} catch { alert('Network error'); }
		finally { grading = false; }
	}

	function formatDate(d: string | null): string {
		if (!d) return '-';
		try { return new Date(d + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }); }
		catch { return d; }
	}

	const typeLabel: Record<string, string> = { text: 'Teks', file: 'File', link: 'Link', github: 'GitHub' };
	const statusVariant: Record<string, string> = { published: 'success', draft: 'warning', archived: 'default' };

	// Expose handlers for DataTable inline HTML buttons
	$effect(() => {
		(window as any).__toggleSubmissions = loadSubmissions;
		(window as any).__editAssignment = (id: string) => {
			const a = assignments.find((x: any) => x.id === id);
			if (a) openEdit(a);
		};
		(window as any).__confirmDeleteAssignment = (id: string) => { confirmDelete = id; };
		(window as any).__deleteAssignment = handleDelete;
		(window as any).__cancelDeleteAssignment = () => { confirmDelete = null; };
		return () => {
			delete (window as any).__toggleSubmissions;
			delete (window as any).__editAssignment;
			delete (window as any).__confirmDeleteAssignment;
			delete (window as any).__deleteAssignment;
			delete (window as any).__cancelDeleteAssignment;
		};
	});

	const assignmentColumns: ColumnDef<any, any>[] = [
		{
			header: 'Judul',
			accessorKey: 'title',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue() || '-'}</span>`
		},
		{
			header: 'Kursus',
			accessorKey: 'course_offering_id',
			cell: ({ getValue }) => `<span style="color:var(--text-secondary);font-size:13px">${offeringName(getValue() as string)}</span>`
		},
		{
			header: 'Tipe',
			accessorKey: 'submission_type',
			cell: ({ getValue }) => `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(113,112,255,0.12);color:#7170ff">${typeLabel[getValue() as string] || getValue()}</span>`
		},
		{
			header: 'Nilai Maks',
			accessorKey: 'max_score',
			cell: ({ getValue }) => `<span style="text-align:center;display:block">${getValue() || '-'}</span>`
		},
		{
			header: 'Tenggat',
			accessorKey: 'due_date',
			cell: ({ getValue }) => `<span style="color:var(--text-secondary);font-size:13px">${formatDate(getValue() as string)}</span>`
		},
		{
			header: 'Status',
			accessorKey: 'status',
			cell: ({ getValue }) => {
				const s = getValue() as string;
				const colors: Record<string, string> = {
					published: 'background:rgba(34,197,94,0.12);color:#22c55e',
					draft: 'background:rgba(245,158,11,0.12);color:#f59e0b',
					archived: 'background:rgba(156,163,175,0.12);color:#9ca3af',
				};
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;text-transform:capitalize;${colors[s] || 'background:rgba(156,163,175,0.12);color:#9ca3af'}">${s}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			enableSorting: false,
			cell: ({ row }) => {
				const a = row.original;
				let html = '<div style="display:flex;gap:4px;align-items:center;white-space:nowrap">';
				html += `<button onclick="window.__toggleSubmissions('${a.id}')" style="padding:4px 8px;background:transparent;border:none;font-size:13px;cursor:pointer" title="Submissions">📥 (${a.submission_count ?? '-'})</button>`;
				html += `<button onclick="window.__editAssignment('${a.id}')" style="padding:4px 8px;background:transparent;border:none;font-size:13px;cursor:pointer" title="Edit">✏️</button>`;
				if (confirmDelete === a.id) {
					html += `<button onclick="window.__deleteAssignment('${a.id}')" style="padding:4px 8px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer">Hapus</button>`;
					html += `<button onclick="window.__cancelDeleteAssignment()" style="padding:4px 8px;background:transparent;color:var(--text-secondary);border:1px solid var(--border);border-radius:6px;font-size:12px;cursor:pointer">Batal</button>`;
				} else {
					html += `<button onclick="window.__confirmDeleteAssignment('${a.id}')" style="padding:4px 8px;background:transparent;border:none;font-size:13px;cursor:pointer" title="Hapus">🗑️</button>`;
				}
				html += '</div>';
				return html;
			}
		}
	];

	function offeringName(id: string): string {
		return offerings.find(o => o.id === id)?.name || id;
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head><title>{t('admin.title')}</title></svelte:head>

<div class="page">
	<div class="stats-row">
		<StatCard icon="📝" value={assignments.length} label="Total Tugas" />
	</div>
	<PageHeader title="📂 Manajemen Tugas" subtitle="{assignments.length} tugas">
		{#snippet action()}
			<select bind:value={selectedOfferingId} onchange={() => { loadLessons(selectedOfferingId); loadData(); }} class="select-input">
				<option value="">Semua Kursus</option>
				{#each offerings as o}
					<option value={o.id}>{o.name}</option>
				{/each}
			</select>
			<Button onclick={openCreate}>+ Buat Tugas</Button>
		{/snippet}
	</PageHeader>

	{#if loading}
		<Card><CardContent><div class="loading-state">Memuat data...</div></CardContent></Card>
	{:else if error}
		<Card><CardContent><div class="error-state">{error}</div></CardContent></Card>
	{:else if assignments.length === 0}
		<EmptyState icon="📝" title="Belum ada tugas" description="Klik &quot;Buat Tugas&quot; untuk membuat baru." />
	{:else}
		<div class="table-wrapper">
			<table class="assign-table">
				<thead>
					<tr>
						<th>{t('admin.judul')}</th>
						<th>Kursus</th>
						<th>{t('admin.tipe')}</th>
						<th>{t('admin.nilai')}</th>
						<th>Tenggat</th>
						<th>{t('common.status')}</th>
						<th>{t('common.action')}</th>
					</tr>
				</thead>
				<tbody>
					{#each assignments as a}
						<tr>
							<td class="title-cell">{a.title || '-'}</td>
							<td class="offering-cell">{offeringName(a.course_offering_id)}</td>
							<td><Badge>{typeLabel[a.submission_type] || a.submission_type}</Badge></td>
							<td class="center-cell">{a.max_score || '-'}</td>
							<td class="date-cell">{formatDate(a.due_date)}</td>
							<td><Badge variant={statusVariant[a.status] || 'default'}>{a.status}</Badge></td>
							<td class="actions-cell">
								<Button variant="ghost" size="sm" onclick={() => loadSubmissions(a.id)}>
									📥 ({a.submission_count ?? '-'})
								</Button>
								<Button variant="ghost" size="sm" onclick={() => openEdit(a)}>✏️</Button>
								{#if confirmDelete === a.id}
									<span class="confirm-group">
										<Button variant="danger" size="sm" onclick={() => handleDelete(a.id)}>{t('common.delete')}</Button>
										<Button variant="ghost" size="sm" onclick={() => confirmDelete = null}>{t('common.cancel')}</Button>
									</span>
								{:else}
									<Button variant="ghost" size="sm" onclick={() => confirmDelete = a.id}>🗑️</Button>
								{/if}
							</td>
						</tr>
						{#if showSubmissions === a.id}
							<tr class="submissions-row">
								<td colspan="7">
									<div class="submissions-panel">
										<h4>Submissions</h4>
										{#if submissionsLoading}
											<p class="loading-sub">Memuat...</p>
										{:else if submissions.length === 0}
											<p class="empty-sub">Belum ada submission.</p>
										{:else}
											<table class="sub-table">
												<thead><tr><th>Siswa</th><th>{t('common.status')}</th><th>Nilai</th><th>Dikirim</th><th>Aksi</th></tr></thead>
												<tbody>
													{#each submissions as s}
														<tr>
															<td>{s.user_name || s.user_id}</td>
															<td><Badge variant={s.status === 'graded' ? 'success' : 'warning'}>{s.status}</Badge></td>
															<td>{s.score !== null ? `${s.score}/${a.max_score}` : '-'}</td>
															<td class="date-cell">{formatDate(s.submitted_at)}</td>
															<td>
																{#if s.status !== 'graded'}
																	<Button size="sm" onclick={() => { gradeId = s.id; gradeScore = 0; gradeFeedback = ''; }}>Nilai</Button>
																{:else}
																	<Button size="sm" variant="ghost" onclick={() => { gradeId = s.id; gradeScore = s.score; gradeFeedback = s.feedback || ''; }}>{t('common.edit')}</Button>
																{/if}
															</td>
														</tr>
													{/each}
												</tbody>
											</table>
										{/if}
									</div>
								</td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create/Edit Modal -->
{#if showModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeModal} role="dialog" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="modal-header">
				<h2>{editingId ? 'Edit Tugas' : 'Buat Tugas Baru'}</h2>
				<button class="modal-close" onclick={closeModal}>✕</button>
			</div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group">
						<label>Kursus</label>
						<select bind:value={form.course_offering_id} onchange={() => loadLessons(form.course_offering_id)} class="select-input">
							<option value="">— Pilih —</option>
							{#each offerings as o}
								<option value={o.id}>{o.name}</option>
							{/each}
						</select>
					</div>
					<div class="form-group">
						<label>Pelajaran (opsional)</label>
						<select bind:value={form.lesson_id} class="select-input">
							<option value="">— Tidak Terkait —</option>
							{#each lessons as l}
								<option value={l.id}>{l.title}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="form-group">
					<label>Judul Tugas</label>
					<input type="text" bind:value={form.title} class="input" placeholder="Nama tugas..." />
				</div>
				<div class="form-group">
					<label>{t('common.description')}</label>
					<textarea bind:value={form.description} class="input" rows="3" placeholder="Deskripsi tugas..."></textarea>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label>Tipe Pengumpulan</label>
						<select bind:value={form.submission_type} class="select-input">
							<option value="text">Teks</option>
							<option value="file">File</option>
							<option value="link">Link</option>
							<option value="github">GitHub</option>
						</select>
					</div>
					<div class="form-group">
						<label>Nilai Maksimal</label>
						<input type="number" bind:value={form.max_score} min="0" class="input" />
					</div>
					<div class="form-group">
						<label>Bobot (%)</label>
						<input type="number" bind:value={form.weight} min="0" class="input" />
					</div>
				</div>
				<div class="form-row">
					<div class="form-group">
						<label>Tenggat</label>
						<input type="datetime-local" bind:value={form.due_date} class="input" />
					</div>
					<div class="form-group">
						<label>{t('common.status')}</label>
						<select bind:value={form.status} class="select-input">
							<option value="draft">{t('admin.draft')}</option>
							<option value="published">{t('admin.published')}</option>
							<option value="archived">Archived</option>
						</select>
					</div>
				</div>
				<div class="form-group checkbox-group">
					<label>
						<input type="checkbox" bind:checked={form.allow_late_submission} />
						<span>Izinkan pengumpulan terlambat</span>
					</label>
				</div>
				{#if form.allow_late_submission}
					<div class="form-group">
						<label>Penalti Keterlambatan (%)</label>
						<input type="number" bind:value={form.late_penalty_percent} min="0" max="100" class="input" />
					</div>
				{/if}
				{#if submitError}
					<div class="submit-error">{submitError}</div>
				{/if}
			</div>
			<div class="modal-footer">
				<Button variant="ghost" onclick={closeModal}>{t('common.cancel')}</Button>
				<Button onclick={handleSubmit} disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
			</div>
		</div>
	</div>
{/if}

<!-- Grade Modal -->
{#if gradeId}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => gradeId = null} role="dialog" tabindex="-1">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal-content modal-sm" onclick={(e) => e.stopPropagation()} role="document" tabindex="-1">
			<div class="modal-header">
				<h2>Nilai Submission</h2>
				<button class="modal-close" onclick={() => gradeId = null}>✕</button>
			</div>
			<div class="modal-body">
				<div class="form-group">
					<label>Nilai</label>
					<input type="number" bind:value={gradeScore} min="0" class="input" />
				</div>
				<div class="form-group">
					<label>Umpan Balik</label>
					<textarea bind:value={gradeFeedback} class="input" rows="3" placeholder="Umpan balik untuk siswa..."></textarea>
				</div>
			</div>
			<div class="modal-footer">
				<Button variant="ghost" onclick={() => gradeId = null}>{t('common.cancel')}</Button>
				<Button onclick={() => handleGrade(gradeId!)} disabled={grading}>{grading ? 'Menyimpan...' : 'Simpan Nilai'}</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1000px; }

	.stats-row {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { font-size: 13px; color: var(--text-secondary); margin: 4px 0 0; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; gap: 12px; flex-wrap: wrap; }
	.header-actions { display: flex; gap: 8px; align-items: center; }

	.select-input, .input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; }
	.select-input:focus, .input:focus { border-color: var(--accent); outline: none; }

	.table-wrapper { overflow-x: auto; border: 1px solid var(--border); border-radius: 10px; }
	.assign-table { width: 100%; border-collapse: collapse; font-size: 14px; }
	.assign-table th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; background: var(--surface); border-bottom: 1px solid var(--border); }
	.assign-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); }
	.assign-table tr:last-child td { border-bottom: none; }
	.assign-table tr:hover { background: rgba(255,255,255,0.02); }
	.title-cell { font-weight: 500; }
	.offering-cell { color: var(--text-secondary); font-size: 13px; }
	.date-cell { color: var(--text-secondary); font-size: 13px; }
	.center-cell { text-align: center; }
	.actions-cell { white-space: nowrap; display: flex; gap: 4px; align-items: center; }
	.confirm-group { display: flex; gap: 4px; align-items: center; }

	.submissions-row td { background: rgba(255,255,255,0.02); padding: 12px 16px; }
	.submissions-panel h4 { margin: 0 0 8px; font-size: 14px; }
	.sub-table { width: 100%; font-size: 13px; border-collapse: collapse; }
	.sub-table th { padding: 6px 10px; text-align: left; font-size: 11px; color: var(--text-secondary); border-bottom: 1px solid var(--border); }
	.sub-table td { padding: 6px 10px; border-bottom: 1px solid var(--border); }
	.loading-sub, .empty-sub { padding: 16px; text-align: center; color: var(--text-secondary); font-size: 13px; }

	.loading-state, .error-state, .empty-state { padding: 40px 20px; text-align: center; color: var(--text-secondary); font-size: 14px; }
	.error-state { color: var(--danger); }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
	.modal-content { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 560px; max-width: 90vw; max-height: 80vh; overflow: auto; }
	.modal-sm { width: 400px; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); }
	.modal-header h2 { margin: 0; font-size: 16px; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; }
	.modal-body { padding: 20px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border); }
	.form-group { margin-bottom: 14px; }
	.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
	.form-row { display: flex; gap: 12px; }
	.form-row .form-group { flex: 1; }
	.checkbox-group label { display: flex; align-items: center; gap: 8px; font-weight: 400; cursor: pointer; }
	.submit-error { padding: 8px 12px; background: rgba(231,76,60,0.1); color: #ef4444; border-radius: 8px; font-size: 13px; }
</style>

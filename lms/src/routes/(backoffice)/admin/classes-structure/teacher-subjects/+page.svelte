<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let assignments: any[] = $state([]);
	let kelasList: any[] = $state([]);
	let mapelList: any[] = $state([]);
	let guruList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterKelas = $state('');
	let filterMapel = $state('');

	let showForm = $state(false);
	let formClassId = $state('');
	let formSubjectId = $state('');
	let formTeacherId = $state('');
	let formSemester = $state(1);
	let formTotalHours = $state(2);
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) { (window as any).__deleteAssignment = deleteAssignment; loadData(); } });

	async function loadData() {
		loading = true; error = '';
		try {
			const [assignRes, kelasRes, mapelRes, guruRes] = await Promise.all([
				fetch('/api/admin/classes-structure/teacher-subjects'),
				fetch('/api/admin/classes-structure/classes'),
				fetch('/api/admin/classes-structure/subjects'),
				fetch('/api/admin/classes-structure/teachers'),
			]);
			const aj = await assignRes.json();
			const kj = await kelasRes.json();
			const mj = await mapelRes.json();
			const gj = await guruRes.json();
			if (aj.success) assignments = aj.data; else error = aj.error || 'Gagal memuat';
			if (kj.success) kelasList = kj.data;
			if (mj.success) mapelList = mj.data;
			if (gj.success) guruList = gj.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function getKelasName(id: string) {
		return kelasList.find(k => k.id === id)?.name || '—';
	}
	function getMapelName(id: string) {
		return mapelList.find(m => m.id === id)?.name || '—';
	}
	function getGuruName(id: string) {
		return guruList.find(g => g.id === id)?.display_name || guruList.find(g => g.id === id)?.name || guruList.find(g => g.id === id)?.username || id?.slice(0, 12) || '—';
	}

	let filtered = $derived(
		assignments.filter(a => {
			if (filterKelas && (a.class_id || a.classId) !== filterKelas) return false;
			if (filterMapel && (a.subject_id || a.subjectId) !== filterMapel) return false;
			return true;
		})
	);

	function openForm() {
		formClassId = ''; formSubjectId = ''; formTeacherId = '';
		formSemester = 1; formTotalHours = 2; saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formClassId || !formSubjectId || !formTeacherId) {
			saveError = 'Kelas, mapel, dan guru wajib dipilih';
			return;
		}
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/classes-structure/teacher-subjects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					class_id: formClassId,
					subject_id: formSubjectId,
					teacher_id: formTeacherId,
					semester: formSemester,
					total_hours_per_week: formTotalHours,
				}),
			});
			const json = await res.json();
			if (json.success) {
				assignments = [...assignments, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function deleteAssignment(id: string) {
		if (!confirm('Yakin hapus penugasan ini?')) return;
		try {
			const res = await fetch(`/api/admin/classes-structure/teacher-subjects/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) assignments = assignments.filter(a => a.id !== id);
		} catch { /* ignore */ }
	}

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Kelas', id: 'kelas', cell: ({ row }) => getKelasName(row.original.class_id || row.original.classId) },
		{ header: 'Mata Pelajaran', id: 'mapel', cell: ({ row }) => getMapelName(row.original.subject_id || row.original.subjectId) },
		{ header: 'Guru', id: 'guru', cell: ({ row }) => getGuruName(row.original.teacher_id || row.original.teacherId) },
		{ header: 'Semester', accessorKey: 'semester', cell: ({ getValue }) => `Smt ${getValue() || 1}` },
		{ header: 'JP/mgg', accessorKey: 'total_hours_per_week', cell: ({ row }) => String(row.original.total_hours_per_week ?? row.original.totalHoursPerWeek ?? '—') },
		{
			header: 'Status', id: 'status',
			cell: ({ row }) => {
				const isActive = row.original.status !== 'inactive';
				return `<span class="status-dot${isActive ? ' active' : ''}"></span>`;
			}
		},
		{
			header: 'Aksi', id: 'aksi',
			cell: ({ row }) => `<button class="btn-danger-icon" onclick="window.__deleteAssignment('${row.original.id}')" title="Hapus">✕</button>`
		},
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>👨‍🏫 Guru Mapel</h1>
			<p class="subtitle">Penugasan guru per kelas & mata pelajaran</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openForm}>+ Assign Baru</Button>
		</div>
	</div>

	<div class="filter-bar">
<Select bind:value={filterKelas} options={kelasList.map((k) => ({ value: k.id, label: k.name }))} />
<Select bind:value={filterMapel} options={mapelList.map((m) => ({ value: m.id, label: m.name }))} />
		<span class="filter-count">{filtered.length} penugasan</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if assignments.length === 0}
		<div class="empty-state">
			<p>Belum ada penugasan guru mapel</p>
			<Button variant="primary" onclick={openForm}>Assign Pertama</Button>
		</div>
	{:else}
		<DataTable {columns} data={filtered} pageSize={20} showSearch={true} searchPlaceholder="Cari kelas/guru..." />
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Assign Guru Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Select label="Kelas" bind:value={formClassId} options={kelasList.map((k) => ({ value: k.id, label: k.name }))} />
				</div>
				<div class="field">
<Select label={t('admin.mapel')} bind:value={formSubjectId} options={mapelList.map((m) => ({ value: m.id, label: m.name }))} />
				</div>
				<div class="field">
<Select label="Guru" bind:value={formTeacherId} options={guruList.map((g) => ({ value: g.id, label: g.display_name || g.name || g.username || g.id?.slice(0, 12) }))} />
				</div>
				<div class="field-row">
					<div class="field">
<Select label={t('admin.semester')} bind:value={formSemester} />
					</div>
					<div class="field">
						<label for="gm-hours">{t('admin.jp_per_minggu')}</label>
						<input id="gm-hours" type="number" bind:value={formTotalHours} min="1" max="40" />
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<Button variant="secondary" onclick={closeForm}>{t('common.cancel')}</Button>
				<Button variant="primary" onclick={submitForm} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page { max-width: 1000px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--hover); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.btn-danger-icon { background: none; border: 1px solid transparent; color: var(--text-secondary); cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
	.btn-danger-icon:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); }

	.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; }
	.filter-count { font-size: 13px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field select:focus, .field input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field-row { display: flex; gap: 12px; }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

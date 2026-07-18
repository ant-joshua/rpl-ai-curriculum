<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let semesterList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let showForm = $state(false);
	let formId = $state('');
	let formName = $state('');
	let formCode = $state('');
	let formTahunAjaran = $state('');
	let formSemester = $state('1');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/academic-semesters');
			const json = await res.json();
			if (json.success) semesterList = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openCreate() {
		formId = ''; formName = ''; formCode = ''; formTahunAjaran = ''; formSemester = '1';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama semester wajib diisi'; return; }
		if (!formTahunAjaran.trim()) { saveError = 'Tahun ajaran wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/academic-semesters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName.trim(),
					code: formCode.trim(),
					tahun_ajaran: formTahunAjaran.trim(),
					semester: formSemester,
				}),
			});
			const json = await res.json();
			if (json.success) {
				semesterList = [...semesterList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function setActive(id: string) {
		try {
			const res = await fetch(`/api/admin/academic-semesters/${id}/active`, { method: 'PUT' });
			const json = await res.json();
			if (json.success) {
				semesterList = semesterList.map(s => ({ ...s, is_active: s.id === id }));
			} else alert(json.error || 'Gagal mengaktifkan');
		} catch { alert('Terjadi kesalahan'); }
	}

	function getSemesterLabel(s: string): string {
		if (s === '1') return 'Ganjil';
		if (s === '2') return 'Genap';
		return s;
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Nama Semester',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
		},
		{
			header: 'Kode',
			accessorKey: 'code',
			cell: ({ getValue }) => {
				const code = getValue() as string;
				return code ? `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${code}</code>` : '<span>—</span>';
			}
		},
		{
			header: 'Tahun Ajaran',
			accessorKey: 'tahun_ajaran',
			cell: ({ getValue, row }) => {
				const val = getValue() as string || row.original.academic_year;
				return val || '—';
			}
		},
		{
			header: 'Semester',
			accessorKey: 'semester',
			cell: ({ getValue, row }) => {
				const val = (getValue() as string) || row.original.semester_value || '';
				return getSemesterLabel(val);
			}
		},
		{
			header: 'Status',
			accessorKey: 'is_active',
			cell: ({ getValue }) => {
				const active = getValue() as boolean;
				if (active) {
					return '<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(16,185,129,0.1);color:#10b981">'+t('common.active')+'</span>';
				}
				return '<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(98,102,109,0.1);color:var(--text-quaternary)">Tidak Aktif</span>';
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ getValue, row }) => {
				const id = getValue() as string;
				if (row.original.is_active) return '<span style="color:var(--text-quaternary);font-size:12px">—</span>';
				return `<button onclick="window.__semSetActive('${id}')" style="padding:4px 10px;border:1px solid rgba(16,185,129,0.3);border-radius:6px;background:rgba(16,185,129,0.1);color:#10b981;font-size:12px;cursor:pointer">Set Aktif</button>`;
			}
		}
	];

	$effect(() => {
		(window as any).__semSetActive = setActive;
	});
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📅 Semester</h1>
			<p class="subtitle">{t('admin.kelola_semester')}</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openCreate}>{t('admin.semester_baru')}</Button>
		</div>
	</div>

	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if semesterList.length === 0}
		<div class="empty-state">
			<p>{t('admin.belum_ada_semester')}</p>
			<Button variant="primary" onclick={openCreate}>{t('admin.buat_semester_pertama')}</Button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<DataTable
					{columns}
					data={semesterList}
					pageSize={20}
					showSearch={false}
					emptyMessage="Belum ada semester"
				/>
			</div>
		</div>
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Semester Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.nama_semester')} bind:value={formName} placeholder="Cth: Semester Ganjil 2025/2026" />
				</div>
				<div class="field-row">
					<div class="field">
<Input label="Kode (opsional)" bind:value={formCode} placeholder="GANJIL-2025" />
					</div>
					<div class="field">
<Input label={t('admin.tahun_ajaran')} bind:value={formTahunAjaran} placeholder="2025/2026" />
					</div>
					<div class="field">
<Select label={t('admin.semester')} bind:value={formSemester} options={[{ value: "1", label: t('admin.ganjil') }, { value: "2", label: t('admin.genap') }]} />
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
	.page { max-width: 960px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }

	.field-row { display: flex; gap: 12px; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

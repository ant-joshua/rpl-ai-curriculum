<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let kelasList: any[] = $state([]);
	let tingkatList: any[] = $state([]);
	let jurusanList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let filterTingkat = $state('');

	let showForm = $state(false);
	let formName = $state('');
	let formCode = $state('');
	let formGradeLevelId = $state('');
	let formMajorId = $state('');
	let formHomeroomTeacherId = $state('');
	let formRoom = $state('');
	let formShift = $state('pagi');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [kelasRes, tingkatRes, jurusanRes] = await Promise.all([
				fetch('/api/admin/classes-structure/classes'),
				fetch('/api/admin/classes-structure/grade-levels'),
				fetch('/api/admin/classes-structure/majors'),
			]);
			const kjson = await kelasRes.json();
			const tjson = await tingkatRes.json();
			const jjson = await jurusanRes.json();
			if (kjson.success) kelasList = kjson.data; else error = kjson.error || 'Gagal memuat kelas';
			if (tjson.success) tingkatList = tjson.data;
			if (jjson.success) jurusanList = jjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		filterTingkat ? kelasList.filter(k => (k.grade_level_id || k.gradeLevelId) === filterTingkat) : kelasList
	);

	function openForm() {
		formName = ''; formCode = ''; formGradeLevelId = ''; formMajorId = '';
		formHomeroomTeacherId = ''; formRoom = ''; formShift = 'pagi';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	function getTingkatName(id: string) {
		return tingkatList.find(t => t.id === id)?.name || '—';
	}
	function getJurusanName(id: string) {
		return jurusanList.find(j => j.id === id)?.name || '—';
	}

	async function submitForm() {
		if (!formName.trim() || !formGradeLevelId) {
			saveError = 'Nama kelas dan tingkat wajib diisi';
			return;
		}
		saving = true; saveError = '';
		try {
			const body: Record<string, any> = {
				name: formName.trim(),
				code: formCode.trim(),
				grade_level_id: formGradeLevelId,
				shift: formShift,
			};
			if (formMajorId) body.major_id = formMajorId;
			if (formHomeroomTeacherId) body.homeroom_teacher_id = formHomeroomTeacherId;
			if (formRoom.trim()) body.room = formRoom.trim();

			const res = await fetch('/api/admin/classes-structure/classes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				kelasList = [...kelasList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}
const classColumns: ColumnDef<any, any>[] = [
	{
		header: 'Nama Kelas',
		accessorKey: 'name',
		cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
	},
	{
		header: 'Kode',
		accessorKey: 'code',
		cell: ({ getValue }) => {
			const v = getValue() as string;
			return v ? `<code>${v}</code>` : '\u2014';
		}
	},
	{
		header: 'Tingkat',
		id: 'tingkat',
		cell: ({ row }) => getTingkatName(row.original.grade_level_id || row.original.gradeLevelId)
	},
	{
		header: 'Jurusan',
		id: 'jurusan',
		cell: ({ row }) => getJurusanName(row.original.major_id || row.original.majorId) || '\u2014'
	},
	{
		header: 'Wali Kelas',
		id: 'wali',
		cell: ({ row }) => row.original.homeroom_teacher_name || row.original.homeroomTeacherName || '\u2014'
	},
	{
		header: 'Ruangan',
		accessorKey: 'room',
		cell: ({ getValue }) => (getValue() as string) || '\u2014'
	},
	{
		header: 'Shift',
		accessorKey: 'shift',
		cell: ({ getValue }) => `<span class="badge">${(getValue() as string) || 'pagi'}</span>`
	},
	{
		header: 'Siswa',
		id: 'siswa',
		cell: ({ row }) => {
			const count = row.original.student_count ?? row.original.siswa;
			return count != null ? `<span style="text-align:center;font-weight:600;display:block">${count}</span>` : '\u2014';
		}
	},
	{
		header: 'Aksi',
		id: 'actions',
		cell: ({ row }) => `<a href="/admin/classes-structure/kelas/${row.original.id}" class="btn-small">Detail</a>`
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
			<h1>🏠 Kelas</h1>
			<p class="subtitle">Rombongan belajar per tingkat</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openForm}>{t('admin.kelas_baru_btn')}</Button>
		</div>
	</div>

	<div class="filter-bar">
<Select bind:value={filterTingkat} options={tingkatList.map((t) => ({ value: t.id, label: t.name }))} />
		<span class="filter-count">{filtered.length} kelas</span>
	</div>

	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if kelasList.length === 0}
		<div class="empty-state">
			<p>{t('admin.belum_ada_kelas')}</p>
			<Button variant="primary" onclick={openForm}>{t('admin.buat_kelas_pertama')}</Button>
		</div>
	{:else}
		<DataTable columns={classColumns} data={filtered} pageSize={20} showSearch={true} searchPlaceholder="Cari kelas..." emptyMessage="Belum ada kelas" />
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>{t('admin.kelas_baru')}</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.nama_kelas')} bind:value={formName} placeholder="Cth: X RPL 1" />
				</div>
				<div class="field">
<Input label="Kode (opsional)" bind:value={formCode} placeholder="X-RPL-1" />
				</div>
				<div class="field">
<Select label={t('admin.tingkat')} bind:value={formGradeLevelId} options={tingkatList.map((t) => ({ value: t.id, label: t.name }))} />
				</div>
				<div class="field">
<Select label="Jurusan (opsional)" bind:value={formMajorId} options={jurusanList.map((j) => ({ value: j.id, label: j.name }))} />
				</div>
				<div class="field">
<Input label="Wali Kelas (opsional)" bind:value={formHomeroomTeacherId} placeholder="User ID wali kelas" />
				</div>
				<div class="field-row">
					<div class="field">
<Input label={t('admin.ruangan')} bind:value={formRoom} placeholder="Cth: R.101" />
					</div>
					<div class="field">
<Select label={t('admin.shift')} bind:value={formShift} options={[{ value: "pagi", label: t('admin.pagi') }, { value: "siang", label: t('admin.siang') }, { value: "sore", label: t('admin.sore') }]} />
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
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--hover); }
	.btn-small { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

	.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; }
	.filter-count { font-size: 13px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-count { text-align: center; font-weight: 600; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--bg-secondary); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }

	/* Modal */
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
	.field-row { display: flex; gap: 12px; }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select, Textarea } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let matkulList: any[] = $state([]);
	let prodiList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterProdi = $state('');

	let showForm = $state(false);
	let formId = $state('');
	let formKode = $state('');
	let formName = $state('');
	let formSks = $state(3);
	let formProdiId = $state('');
	let formSemester = $state(1);
	let formSifat = $state('wajib');
	let formDescription = $state('');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [mkRes, prodiRes] = await Promise.all([
				fetch('/api/admin/course-catalog'),
				fetch('/api/admin/study-programs'),
			]);
			const mjson = await mkRes.json();
			const pjson = await prodiRes.json();
			if (mjson.success) matkulList = mjson.data;
			else error = mjson.error || 'Gagal memuat katalog';
			if (pjson.success) prodiList = pjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		matkulList.filter(m => {
			if (filterProdi && (m.prodi_id || m.major_id) !== filterProdi) return false;
			return true;
		})
	);

	function getProdiName(id: string) {
		return prodiList.find(p => p.id === id)?.name || '—';
	}

	function openCreate() {
		formId = ''; formKode = ''; formName = ''; formSks = 3;
		formProdiId = ''; formSemester = 1; formSifat = 'wajib'; formDescription = '';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama mata kuliah wajib diisi'; return; }
		if (!formKode.trim()) { saveError = 'Kode mata kuliah wajib diisi'; return; }
		if (!formProdiId) { saveError = 'Pilih program studi'; return; }
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/course-catalog', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					kode: formKode.trim(),
					name: formName.trim(),
					sks: formSks,
					prodi_id: formProdiId,
					semester: formSemester,
					sifat: formSifat,
					description: formDescription.trim(),
				}),
			});
			const json = await res.json();
			if (json.success) {
				matkulList = [...matkulList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	const sifatLabels: Record<string, string> = {
		wajib: 'Wajib', pilihan: 'Pilihan', wajib_peminatan: 'Wajib Peminatan',
	};
	const sifatColors: Record<string, string> = {
		wajib: 'background:rgba(94,106,210,0.1);color:#5e6ad2',
		pilihan: 'background:rgba(16,185,129,0.1);color:#10b981',
		wajib_peminatan: 'background:rgba(245,158,11,0.1);color:#f59e0b',
	};

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Kode',
			accessorKey: 'kode',
			cell: ({ getValue, row }) => {
				const val = getValue() as string || row.original.code;
				return val ? `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${val}</code>` : '<span>—</span>';
			}
		},
		{
			header: 'Nama Mata Kuliah',
			accessorKey: 'name',
			cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>`
		},
		{
			header: 'SKS',
			accessorKey: 'sks',
			cell: ({ getValue, row }) => {
				const val = getValue() ?? row.original.credits;
				return `<span style="text-align:center">${val ?? '—'}</span>`;
			}
		},
		{
			header: 'Program Studi',
			accessorKey: 'prodi_id',
			cell: ({ getValue, row }) => {
				const id = getValue() as string || row.original.major_id;
				return getProdiName(id);
			}
		},
		{
			header: 'Semester',
			accessorKey: 'semester',
			cell: ({ getValue, row }) => {
				const val = getValue() ?? row.original.semester_value;
				return `<span style="text-align:center">${val ?? '—'}</span>`;
			}
		},
		{
			header: 'Sifat',
			accessorKey: 'sifat',
			cell: ({ getValue, row }) => {
				const sifat = (getValue() as string) || row.original.type || 'wajib';
				const style = sifatColors[sifat] || sifatColors.wajib;
				const label = sifatLabels[sifat] || sifat;
				return `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;${style}">${label}</span>`;
			}
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ getValue }) => `<a href="/admin/course-catalog/${getValue()}" style="color:var(--accent);text-decoration:none;font-size:13px;font-weight:500">Detail</a>`
		}
	];
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📚 Katalog Mata Kuliah</h1>
			<p class="subtitle">Daftar mata kuliah berdasarkan program studi</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openCreate}>{t('admin.matkul_baru')}</Button>
		</div>
	</div>

	<div class="filter-bar">
<Select bind:value={filterProdi} options={prodiList.map((p) => ({ value: p.id, label: p.name }))} />
		<span class="filter-count">{filtered.length} mata kuliah</span>
	</div>

	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if matkulList.length === 0}
		<div class="empty-state">
			<p>{t('admin.belum_ada_matkul')}</p>
			<Button variant="primary" onclick={openCreate}>{t('admin.buat_matkul_pertama')}</Button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<DataTable
					{columns}
					data={filtered}
					pageSize={20}
					showSearch={false}
					emptyMessage="Belum ada mata kuliah"
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
				<h2>Mata Kuliah Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field-row">
					<div class="field">
<Input label={t('admin.kode')} bind:value={formKode} placeholder="Cth: IF-101" />
					</div>
					<div class="field">
						<label for="mk-sks">{t('admin.sks')}</label>
						<input id="mk-sks" type="number" bind:value={formSks} min="1" max="24" />
					</div>
				</div>
				<div class="field">
<Input label={t('admin.mata_kuliah')} bind:value={formName} placeholder="Cth: Algoritma & Pemrograman" />
				</div>
				<div class="field-row">
					<div class="field">
<Select label={t('admin.program_studi')} bind:value={formProdiId} options={prodiList.map((p) => ({ value: p.id, label: p.name }))} />
					</div>
					<div class="field">
<Select label={t('admin.semester')} bind:value={formSemester} options={[{ value: "1", label: "Semester 1" }, { value: "2", label: "Semester 2" }, { value: "3", label: "Semester 3" }, { value: "4", label: "Semester 4" }, { value: "5", label: "Semester 5" }, { value: "6", label: "Semester 6" }, { value: "7", label: "Semester 7" }, { value: "8", label: "Semester 8" }]} />
					</div>
					<div class="field">
<Select label={t('admin.sifat')} bind:value={formSifat} options={[{ value: "wajib", label: t('admin.wajib') }, { value: "pilihan", label: t('admin.pilihan') }, { value: "wajib_peminatan", label: "Wajib Peminatan" }]} />
					</div>
				</div>
				<div class="field">
<Textarea label="Deskripsi (opsional)" placeholder="Deskripsi mata kuliah..." bind:value={formDescription} rows=3 />
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
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

	.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; }
	.filter-count { font-size: 13px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }

	.field-row { display: flex; gap: 12px; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 580px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; resize: vertical; font-family: inherit; }
	.field textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

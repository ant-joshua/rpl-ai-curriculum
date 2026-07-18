<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let prodiList: any[] = $state([]);
	let fakultasList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterFakultas = $state('');

	let showForm = $state(false);
	let showEdit = $state(false);
	let formId = $state('');
	let formName = $state('');
	let formCode = $state('');
	let formFakultasId = $state('');
	let formJenjang = $state('S1');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => {
		if (browser) {
			(window as any).__openEditProdi = openEdit;
			loadData();
		}
	});

	async function loadData() {
		loading = true; error = '';
		try {
			const [prodiRes, fakRes] = await Promise.all([
				fetch('/api/admin/study-programs'),
				fetch('/api/admin/faculties'),
			]);
			const pjson = await prodiRes.json();
			const fjson = await fakRes.json();
			if (pjson.success) prodiList = pjson.data;
			else error = pjson.error || 'Gagal memuat prodi';
			if (fjson.success) fakultasList = fjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		prodiList.filter(p => {
			if (filterFakultas && (p.fakultas_id || p.faculty_id) !== filterFakultas) return false;
			return true;
		})
	);

	function getFakultasName(id: string) {
		return fakultasList.find(f => f.id === id)?.name || '—';
	}

	function openCreate() {
		formId = ''; formName = ''; formCode = ''; formFakultasId = ''; formJenjang = 'S1';
		saveError = ''; showForm = true;
	}
	function openEdit(p: any) {
		formId = p.id; formName = p.name; formCode = p.code || '';
		formFakultasId = p.fakultas_id || p.faculty_id || '';
		formJenjang = p.jenjang || p.degree_level || 'S1';
		saveError = ''; showEdit = true;
	}
	function closeForm() { showForm = false; showEdit = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama prodi wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const method = formId ? 'PUT' : 'POST';
			const url = formId ? `/api/admin/study-programs/${formId}` : '/api/admin/study-programs';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName.trim(),
					code: formCode.trim(),
					fakultas_id: formFakultasId,
					jenjang: formJenjang,
				}),
			});
			const json = await res.json();
			if (json.success) {
				if (formId) {
					prodiList = prodiList.map(p => p.id === formId ? json.data : p);
				} else {
					prodiList = [...prodiList, json.data];
				}
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	const jenjangLabels: Record<string, string> = {
		'D3': 'D3', 'D4': 'D4', 'S1': 'S1', 'S2': 'S2', 'S3': 'S3', 'Profesi': 'Profesi', 'Spesialis': 'Spesialis',
	};
	const jenjangColors: Record<string, string> = {
		'D3': 'background:rgba(16,185,129,0.1);color:#10b981',
		'D4': 'background:rgba(94,106,210,0.1);color:#5e6ad2',
		'S1': 'background:rgba(94,106,210,0.1);color:#5e6ad2',
		'S2': 'background:rgba(245,158,11,0.1);color:#f59e0b',
		'S3': 'background:rgba(239,68,68,0.1);color:#ef4444',
	};

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Nama Prodi', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
		{ header: 'Kode', accessorKey: 'code', cell: ({ getValue }) => `<code>${getValue() || '—'}</code>` },
		{ header: 'Fakultas', id: 'fakultas', cell: ({ row }) => getFakultasName(row.original.fakultas_id || row.original.faculty_id) },
		{
			header: 'Jenjang', id: 'jenjang',
			cell: ({ row }) => {
				const j = row.original.jenjang || row.original.degree_level || 'S1';
				return `<span class="jenjang-badge" style="${jenjangColors[j] || ''}">${jenjangLabels[j] || j}</span>`;
			}
		},
		{
			header: 'Aksi', id: 'aksi',
			cell: ({ row }) => `<button class="btn-edit" onclick="window.__openEditProdi(${JSON.stringify(row.original).replace(/"/g, '&quot;')})">$'+t('common.edit')+'</button>`
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
			<h1>🎓 Program Studi</h1>
			<p class="subtitle">Kelola program studi per fakultas</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openCreate}>+ Prodi Baru</Button>
		</div>
	</div>

	<div class="filter-bar">
<Select bind:value={filterFakultas} options={fakultasList.map((f) => ({ value: f.id, label: f.name }))} />
		<span class="filter-count">{filtered.length} prodi</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if prodiList.length === 0}
		<div class="empty-state">
			<p>Belum ada program studi</p>
			<Button variant="primary" onclick={openCreate}>Buat Prodi Pertama</Button>
		</div>
	{:else}
		<DataTable {columns} data={filtered} pageSize={20} showSearch={true} searchPlaceholder="Cari prodi..." />
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Prodi Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.prodi')} bind:value={formName} placeholder="Cth: Teknik Informatika" />
				</div>
				<div class="field-row">
					<div class="field">
<Input label={t('common.code')} bind:value={formCode} placeholder="IF" />
					</div>
					<div class="field">
<Select label="Jenjang" bind:value={formJenjang} options={[{ value: "D3", label: "D3" }, { value: "D4", label: "D4" }, { value: "S1", label: "S1" }, { value: "S2", label: "S2" }, { value: "S3", label: "S3" }, { value: "Profesi", label: "Profesi" }, { value: "Spesialis", label: "Spesialis" }]} />
					</div>
				</div>
				<div class="field">
<Select label="Fakultas" bind:value={formFakultasId} options={fakultasList.map((f) => ({ value: f.id, label: f.name }))} />
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

{#if showEdit}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Edit Prodi</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.prodi')} bind:value={formName} />
				</div>
				<div class="field-row">
					<div class="field">
<Input label={t('common.code')} bind:value={formCode} />
					</div>
					<div class="field">
<Select label="Jenjang" bind:value={formJenjang} options={[{ value: "D3", label: "D3" }, { value: "D4", label: "D4" }, { value: "S1", label: "S1" }, { value: "S2", label: "S2" }, { value: "S3", label: "S3" }, { value: "Profesi", label: "Profesi" }, { value: "Spesialis", label: "Spesialis" }]} />
					</div>
				</div>
				<div class="field">
<Select label="Fakultas" bind:value={formFakultasId} options={fakultasList.map((f) => ({ value: f.id, label: f.name }))} />
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
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }
	.btn-edit { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--accent); font-size: 12px; cursor: pointer; }
	.btn-edit:hover { background: var(--accent-dim); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }

	.filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
	.filter-select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; }
	.filter-count { font-size: 13px; color: var(--text-secondary); background: var(--bg-secondary); padding: 4px 10px; border-radius: 20px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }

	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
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

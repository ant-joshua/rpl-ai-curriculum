<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let jurusanList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let showForm = $state(false);
	let formName = $state('');
	let formCode = $state('');
	let formType = $state('umum');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/classes-structure/majors');
			const json = await res.json();
			if (json.success) jurusanList = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openForm() {
		formName = ''; formCode = ''; formType = 'umum';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama jurusan wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/classes-structure/majors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: formName.trim(), code: formCode.trim(), type: formType }),
			});
			const json = await res.json();
			if (json.success) {
				jurusanList = [...jurusanList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	const typeLabels: Record<string, string> = {
		umum: 'Umum',
		keahlian: 'Keahlian',
		agama: 'Agama',
		olahraga: 'Olahraga',
		seni: 'Seni',
	};
	const typeColors: Record<string, string> = {
		umum: 'var(--bg-secondary); color: var(--text-secondary)',
		keahlian: 'background: rgba(79,70,229,0.1); color: #4F46E5',
		agama: 'background: rgba(16,185,129,0.1); color: #10b981',
		olahraga: 'background: rgba(245,158,11,0.1); color: #f59e0b',
		seni: 'background: rgba(236,72,153,0.1); color: #ec4899',
	};

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Nama Jurusan', accessorKey: 'name' },
		{
			header: 'Kode',
			accessorKey: 'code',
			cell: ({ getValue }) => `<code>${getValue() || '—'}</code>`
		},
		{
			header: 'Tipe',
			accessorKey: 'type',
			cell: ({ getValue }) => {
				const t = getValue() as string;
				const style = typeColors[t] || typeColors['umum'];
				const label = typeLabels[t] || t;
				return `<span class="type-badge" style="${style}">${label}</span>`;
			}
		},
		{
			header: 'Kelas Terkait',
			accessorFn: (row) => row.kelas_count ?? row.class_count ?? '—'
		},
		{
			header: 'Aksi',
			accessorKey: 'id',
			cell: ({ getValue }) => `<a href="/admin/classes-structure/kelas?jurusan=${getValue()}" class="btn-small">$'+t('admin.lihat_kelas')+'</a>`
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
			<h1>📐 Jurusan</h1>
			<p class="subtitle">Program keahlian & peminatan</p>
		</div>
		<div class="header-actions">
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openForm}>+ Jurusan Baru</Button>
		</div>
	</div>

	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if jurusanList.length === 0}
		<div class="empty-state">
			<p>Belum ada jurusan</p>
			<Button variant="primary" onclick={openForm}>Buat Jurusan Pertama</Button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<DataTable {columns} data={jurusanList} pageSize={20} showSearch={true} searchPlaceholder="Cari jurusan..." emptyMessage="Belum ada jurusan" emptyIcon="📐" />
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
				<h2>Jurusan Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label="Nama Jurusan" bind:value={formName} placeholder="Cth: Rekayasa Perangkat Lunak" />
				</div>
				<div class="field">
<Input label="Kode (opsional)" bind:value={formCode} placeholder="RPL" />
				</div>
				<div class="field">
<Select label={t('admin.tipe')} bind:value={formType} options={[{ value: "umum", label: "Umum" }, { value: "keahlian", label: "Keahlian" }, { value: "agama", label: "Agama" }, { value: "olahraga", label: "Olahraga" }, { value: "seni", label: "Seni" }]} />
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
	.btn-refresh:hover { background: var(--hover); }
	.btn-small { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.empty-state p { margin-bottom: 16px; }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	.btn-small { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.type-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

	/* Modal */
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

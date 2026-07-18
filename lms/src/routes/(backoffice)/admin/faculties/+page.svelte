<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, PageHeader } from '$lib/components/ui';

	let fakultasList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let showForm = $state(false);
	let showEdit = $state(false);
	let formId = $state('');
	let formName = $state('');
	let formCode = $state('');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/faculties');
			const json = await res.json();
			if (json.success) fakultasList = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openCreate() {
		formId = ''; formName = ''; formCode = '';
		saveError = ''; showForm = true;
	}
	function openEdit(f: any) {
		formId = f.id; formName = f.name; formCode = f.code || '';
		saveError = ''; showEdit = true;
	}
	function closeForm() { showForm = false; showEdit = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama fakultas wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const method = formId ? 'PUT' : 'POST';
			const url = formId ? `/api/admin/faculties/${formId}` : '/api/admin/faculties';
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: formName.trim(), code: formCode.trim() }),
			});
			const json = await res.json();
			if (json.success) {
				if (formId) {
					fakultasList = fakultasList.map(f => f.id === formId ? json.data : f);
				} else {
					fakultasList = [...fakultasList, json.data];
				}
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	async function deleteFakultas(id: string) {
		if (!confirm('Hapus fakultas ini?')) return;
		try {
			const res = await fetch(`/api/admin/faculties/${id}`, { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				fakultasList = fakultasList.filter(f => f.id !== id);
			} else alert(json.error || 'Gagal menghapus');
		} catch { alert('Terjadi kesalahan'); }
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<PageHeader title="🏛️ Fakultas" subtitle="Kelola data fakultas">
		{#snippet action()}
			<Button class="btn-refresh" onclick={loadData}>🔄</Button>
			<Button variant="primary" onclick={openCreate}>{t('admin.fakultas_baru')}</Button>
		{/snippet}
	</PageHeader>

	{#if loading}
		<div class="loading">{t('admin.memuat_data')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>{t('common.retry')}</Button>
		</div>
	{:else if fakultasList.length === 0}
		<div class="empty-state">
			<p>{t('admin.belum_ada_fakultas')}</p>
			<Button variant="primary" onclick={openCreate}>{t('admin.buat_fakultas_pertama')}</Button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<DataTable
					columns={[
						{ key: 'name', label: 'Nama Fakultas' },
						{ key: 'code', label: 'Kode' },
						{ key: 'prodi_count', label: 'Prodi Terkait' },
						{ key: 'actions', label: 'Aksi' }
					]}
					data={fakultasList.map(f => ({ ...f, code: f.code || '—', prodi_count: f.prodi_count ?? f.major_count ?? '—' }))}
					emptyMessage="Belum ada fakultas"
				>
					{#snippet cell({ column, row })}
						{#if column.key === 'name'}
							<span class="cell-name">{row.name}</span>
						{:else if column.key === 'code'}
							<code>{row.code}</code>
						{:else if column.key === 'prodi_count'}
							<span class="cell-count">{row.prodi_count}</span>
						{:else if column.key === 'actions'}
							<div class="cell-actions">
								<Button class="btn-edit" onclick={() => openEdit(row)}>{t('common.edit')}</Button>
								<Button class="btn-delete" onclick={() => deleteFakultas(row.id)}>{t('common.delete')}</Button>
							</div>
						{/if}
					{/snippet}
				</DataTable>
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
				<h2>Fakultas Baru</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.nama_fakultas')} bind:value={formName} placeholder="Cth: Fakultas Ilmu Komputer" />
				</div>
				<div class="field">
<Input label="Kode (opsional)" bind:value={formCode} placeholder="FIK" />
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
				<h2>Edit Fakultas</h2>
				<Button class="modal-close" onclick={closeForm}>✕</Button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
<Input label={t('admin.nama_fakultas')} bind:value={formName} />
				</div>
				<div class="field">
<Input label={t('common.code')} bind:value={formCode} />
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
	.btn-edit { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--accent); font-size: 12px; cursor: pointer; margin-right: 6px; }
	.btn-edit:hover { background: var(--accent-dim); }
	.btn-delete { padding: 4px 10px; border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; background: transparent; color: #ef4444; font-size: 12px; cursor: pointer; }
	.btn-delete:hover { background: rgba(239,68,68,0.1); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
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
	.cell-actions { white-space: nowrap; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }

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

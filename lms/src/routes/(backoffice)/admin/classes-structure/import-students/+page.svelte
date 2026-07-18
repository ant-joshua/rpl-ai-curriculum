<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Button, DataTable, Input, Select } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let file: File | null = $state(null);
	let fileName = $state('');
	let previewData: any[] = $state([]);
	let previewHeaders: string[] = $state([]);
	let previewColumns: ColumnDef<any, any>[] = $state([]);
	let importResult: any = $state(null);
	let step: 'upload' | 'preview' | 'result' = $state('upload');

	let uploading = $state(false);
	let importing = $state(false);
	let error = $state('');

	let kelasList: any[] = $state([]);
	let selectedKelas = $state('');

	onMount(() => {
		if (!browser) return;
		fetchKelas();
	});

	async function fetchKelas() {
		try {
			const res = await fetch('/api/admin/classes-structure/classes');
			const json = await res.json();
			if (json.success) kelasList = json.data;
		} catch { /* non-critical */ }
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files?.length) return;
		file = input.files[0];
		fileName = file.name;
		error = '';
		step = 'upload';
	}

	async function uploadAndPreview() {
		if (!file) { error = 'Pilih file CSV terlebih dahulu'; return; }
		if (!selectedKelas) { error = 'Pilih kelas tujuan'; return; }

		uploading = true; error = '';
		try {
			const form = new FormData();
			form.append('file', file);
			form.append('kelas_id', selectedKelas);

			const res = await fetch('/api/admin/classes-structure/import-students/preview', {
				method: 'POST',
				body: form,
			});
			const json = await res.json();
			if (json.success) {
				previewData = (json.data.rows || []).map((r: any, i: number) => ({ ...r, _row_num: i + 1 }));
				previewHeaders = json.data.headers || [];
				previewColumns = [
					{ header: '#', accessorKey: '_row_num', cell: (ctx: any) => ctx.getValue() },
					...previewHeaders.map(h => ({ header: h, accessorKey: h })),
				];
				step = 'preview';
			} else {
				error = json.error || 'Gagal membaca file';
			}
		} catch {
			error = 'Gagal mengupload file';
		} finally {
			uploading = false;
		}
	}

	async function doImport() {
		if (!file) return;
		importing = true; error = '';
		try {
			const form = new FormData();
			form.append('file', file);
			form.append('kelas_id', selectedKelas);

			const res = await fetch('/api/admin/classes-structure/import-students', {
				method: 'POST',
				body: form,
			});
			const json = await res.json();
			if (json.success) {
				importResult = json.data;
				step = 'result';
			} else {
				error = json.error || 'Gagal import';
			}
		} catch {
			error = 'Gagal melakukan import';
		} finally {
			importing = false;
		}
	}

	function reset() {
		file = null;
		fileName = '';
		previewData = [];
		previewHeaders = [];
		previewColumns = [];
		importResult = null;
		step = 'upload';
		error = '';
		selectedKelas = '';
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📥 Import Siswa</h1>
			<p class="subtitle">Import data siswa dari file CSV</p>
		</div>
		{#if step !== 'upload'}
			<Button variant="secondary" onclick={reset}>← Kembali</Button>
		{/if}
	</div>

	{#if error}
		<div class="error-banner">{error}</div>
	{/if}

	{#if step === 'upload'}
		<div class="card upload-card">
			<div class="field">
<Select label="Kelas Tujuan" bind:value={selectedKelas} options={kelasList.map((k) => ({ value: k.id, label: k.name }))} />
			</div>

			<div class="field">
				<label for="file-input">File CSV</label>
				<div class="dropzone">
<Input  />
						id="file-input"
						type="file"
						accept=".csv"
						onchange={handleFileChange}
						class="file-input-hidden"
					/>
					{#if fileName}
						<div class="file-selected">
							<span class="file-icon">📄</span>
							<span class="file-name">{fileName}</span>
							<Button class="btn-small" onclick={() => { file = null; fileName = ''; }}>Ganti</Button>
						</div>
					{:else}
						<div class="dropzone-placeholder">
							<span class="dz-icon">📂</span>
							<p class="dz-text">Klik atau tarik file CSV ke sini</p>
							<p class="dz-hint">Format: NIS, Nama, Jenis Kelamin, dll.</p>
						</div>
					{/if}
				</div>
			</div>

			<div class="field">
				<label>Format CSV yang diharapkan</label>
				<div class="format-box">
					<code>nis,nama,jenis_kelamin,tempat_lahir,tanggal_lahir,alamat,nisn</code>
					<code>12345,Andi Pratama,L,Jakarta,2008-05-12,Jl. Merdeka No.1,</code>
				</div>
			</div>

			<div class="actions">
				<Button
					class="btn-primary"
					onclick={uploadAndPreview}
					disabled={!file || !selectedKelas || uploading}
				>
					{uploading ? 'Membaca file...' : '📋 Pratinjau'}
				</Button>
			</div>
		</div>

	{:else if step === 'preview'}
		<div class="card">
			<div class="card-header">
				<h2>Pratinjau Data ({previewData.length} baris)</h2>
				<div class="card-header-actions">
					<Button variant="secondary" onclick={() => step = 'upload'}>{t('common.back')}</Button>
					<Button variant="primary" onclick={doImport} disabled={importing || previewData.length === 0}>
						{importing ? 'Mengimport...' : '✅ Import ke Kelas'}
					</Button>
				</div>
			</div>

			<div class="table-container">
				<DataTable columns={previewColumns} data={previewData} pageSize={20} showSearch={false} showPagination={true} />
			</div>

			{#if previewData.length > 50}
				<div class="table-note">Menampilkan semua {previewData.length} baris</div>
			{/if}
		</div>

	{:else if step === 'result'}
		<div class="card result-card">
			<div class="result-icon">✅</div>
			<h2>{t('admin.import_berhasil')}</h2>

			<div class="result-stats">
				<div class="rstat">
					<span class="rstat-value">{importResult?.imported ?? importResult?.success ?? 0}</span>
					<span class="rstat-label">{t('common.berhasil')}</span>
				</div>
				<div class="rstat">
					<span class="rstat-value rstat-error">{importResult?.errors ?? importResult?.failed ?? 0}</span>
					<span class="rstat-label">{t('common.gagal')}</span>
				</div>
				<div class="rstat">
					<span class="rstat-value">{importResult?.total ?? previewData.length}</span>
					<span class="rstat-label">{t('common.total')}</span>
				</div>
			</div>

			{#if importResult?.error_details?.length}
				<div class="error-details">
					<h3>Detail Error</h3>
					<ul>
						{#each importResult.error_details as err}
							<li>{err}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="actions">
				<Button variant="primary" onclick={reset}>{t('admin.import_lagi')}</Button>
				<a href="/admin/classes-structure/kelas/{selectedKelas}" class="btn-cancel">{t('admin.lihat_kelas')}</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 900px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }

	.btn-primary { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-cancel { display: inline-flex; align-items: center; padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; text-decoration: none; }
	.btn-small { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 12px; }

	.error-banner { padding: 12px 16px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }

	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.upload-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
	.result-card { padding: 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
	.result-icon { font-size: 48px; }
	.result-card h2 { margin: 0; font-size: 20px; font-weight: 700; }

	.field { display: flex; flex-direction: column; gap: 6px; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field select { padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }

	.actions { display: flex; gap: 10px; align-items: center; }

	.dropzone {
		border: 2px dashed var(--border);
		border-radius: 12px;
		padding: 40px;
		text-align: center;
		cursor: pointer;
		transition: border-color 0.15s;
		position: relative;
	}
	.dropzone:hover { border-color: var(--accent); }
	.file-input-hidden { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
	.dz-icon { font-size: 36px; }
	.dz-text { font-size: 15px; font-weight: 500; color: var(--text); margin: 8px 0 4px; }
	.dz-hint { font-size: 12px; color: var(--text-secondary); margin: 0; }

	.file-selected { display: flex; align-items: center; gap: 12px; justify-content: center; }
	.file-icon { font-size: 28px; }
	.file-name { font-size: 15px; font-weight: 500; color: var(--text); }

	.format-box { display: flex; flex-direction: column; gap: 4px; background: var(--bg-secondary); padding: 12px; border-radius: 8px; }
	.format-box code { font-size: 12px; color: var(--text-secondary); background: none; padding: 0; }

	.card-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
	.card-header h2 { margin: 0; font-size: 15px; font-weight: 600; }
	.card-header-actions { display: flex; gap: 8px; }

	.table-note { padding: 12px 18px; font-size: 13px; color: var(--text-secondary); text-align: center; border-top: 1px solid var(--border); }

	.result-stats { display: flex; gap: 32px; margin: 8px 0; }
	.rstat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
	.rstat-value { font-size: 32px; font-weight: 700; color: var(--accent); }
	.rstat-value.rstat-error { color: #ef4444; }
	.rstat-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }

	.error-details { text-align: left; width: 100%; max-width: 500px; background: rgba(239,68,68,0.05); border: 1px solid rgba(239,68,68,0.15); border-radius: 8px; padding: 14px; }
	.error-details h3 { font-size: 13px; font-weight: 600; margin: 0 0 8px; color: #ef4444; }
	.error-details ul { margin: 0; padding-left: 20px; font-size: 12px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px; }
</style>

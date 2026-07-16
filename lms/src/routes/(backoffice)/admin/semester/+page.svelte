<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

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
			const res = await fetch('/api/admin/semester');
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
			const method = 'POST';
			const url = '/api/admin/semester';
			const res = await fetch(url, {
				method,
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
			const res = await fetch(`/api/admin/semester/${id}/active`, { method: 'PUT' });
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
</script>

<svelte:head>
	<title>Semester — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📅 Semester</h1>
			<p class="subtitle">Kelola semester akademik</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Semester Baru</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if semesterList.length === 0}
		<div class="empty-state">
			<p>Belum ada semester</p>
			<button class="btn-primary" onclick={openCreate}>Buat Semester Pertama</button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Nama Semester</th>
							<th>Kode</th>
							<th>Tahun Ajaran</th>
							<th>Semester</th>
							<th>Status</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each semesterList as s}
							<tr>
								<td class="cell-name">{s.name}</td>
								<td><code>{s.code || '—'}</code></td>
								<td>{s.tahun_ajaran || s.academic_year || '—'}</td>
								<td>{getSemesterLabel(s.semester || s.semester_value || '')}</td>
								<td>
									{#if s.is_active}
										<span class="status-active">Aktif</span>
									{:else}
										<span class="status-inactive">Tidak Aktif</span>
									{/if}
								</td>
								<td class="cell-actions">
									{#if !s.is_active}
										<button class="btn-activate" onclick={() => setActive(s.id)}>Set Aktif</button>
									{:else}
										<span class="text-muted">—</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
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
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
					<label for="sem-name">Nama Semester</label>
					<input id="sem-name" type="text" bind:value={formName} placeholder="Cth: Semester Ganjil 2025/2026" />
				</div>
				<div class="field-row">
					<div class="field">
						<label for="sem-code">Kode (opsional)</label>
						<input id="sem-code" type="text" bind:value={formCode} placeholder="GANJIL-2025" />
					</div>
					<div class="field">
						<label for="sem-tahun">Tahun Ajaran</label>
						<input id="sem-tahun" type="text" bind:value={formTahunAjaran} placeholder="2025/2026" />
					</div>
					<div class="field">
						<label for="sem-value">Semester</label>
						<select id="sem-value" bind:value={formSemester}>
							<option value="1">Ganjil</option>
							<option value="2">Genap</option>
						</select>
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={closeForm}>Batal</button>
				<button class="btn-primary" onclick={submitForm} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan'}
				</button>
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
	.btn-activate { padding: 4px 10px; border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; background: rgba(16,185,129,0.1); color: #10b981; font-size: 12px; cursor: pointer; }
	.btn-activate:hover { background: rgba(16,185,129,0.2); }
	.btn-cancel { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 13px; }
	.text-muted { color: var(--text-quaternary); font-size: 12px; }

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
	.cell-actions { white-space: nowrap; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.status-active { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(16,185,129,0.1); color: #10b981; }
	.status-inactive { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: rgba(98, 102, 109, 0.1); color: var(--text-quaternary); }

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

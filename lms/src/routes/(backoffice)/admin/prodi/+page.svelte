<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

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

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [prodiRes, fakRes] = await Promise.all([
				fetch('/api/admin/prodi'),
				fetch('/api/admin/fakultas'),
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
			const url = formId ? `/api/admin/prodi/${formId}` : '/api/admin/prodi';
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
		'D3': 'D3',
		'D4': 'D4',
		'S1': 'S1',
		'S2': 'S2',
		'S3': 'S3',
		'Profesi': 'Profesi',
		'Spesialis': 'Spesialis',
	};
	const jenjangColors: Record<string, string> = {
		'D3': 'background:rgba(16,185,129,0.1);color:#10b981',
		'D4': 'background:rgba(99,102,241,0.1);color:#6366f1',
		'S1': 'background:rgba(94,106,210,0.1);color:#5e6ad2',
		'S2': 'background:rgba(245,158,11,0.1);color:#f59e0b',
		'S3': 'background:rgba(239,68,68,0.1);color:#ef4444',
	};
</script>

<svelte:head>
	<title>Prodi — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🎓 Program Studi</h1>
			<p class="subtitle">Kelola program studi per fakultas</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Prodi Baru</button>
		</div>
	</div>

	<div class="filter-bar">
		<select bind:value={filterFakultas} class="filter-select">
			<option value="">Semua Fakultas</option>
			{#each fakultasList as f}
				<option value={f.id}>{f.name}</option>
			{/each}
		</select>
		<span class="filter-count">{filtered.length} prodi</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if prodiList.length === 0}
		<div class="empty-state">
			<p>Belum ada program studi</p>
			<button class="btn-primary" onclick={openCreate}>Buat Prodi Pertama</button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Nama Prodi</th>
							<th>Kode</th>
							<th>Fakultas</th>
							<th>Jenjang</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each filtered as p}
							<tr>
								<td class="cell-name">{p.name}</td>
								<td><code>{p.code || '—'}</code></td>
								<td>{getFakultasName(p.fakultas_id || p.faculty_id)}</td>
								<td>
									<span class="jenjang-badge" style={jenjangColors[p.jenjang || p.degree_level || 'S1']}>
										{jenjangLabels[p.jenjang || p.degree_level || 'S1']}
									</span>
								</td>
								<td class="cell-actions">
									<button class="btn-edit" onclick={() => openEdit(p)}>Edit</button>
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
				<h2>Prodi Baru</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
					<label for="prodi-name">Nama Program Studi</label>
					<input id="prodi-name" type="text" bind:value={formName} placeholder="Cth: Teknik Informatika" />
				</div>
				<div class="field-row">
					<div class="field">
						<label for="prodi-code">Kode</label>
						<input id="prodi-code" type="text" bind:value={formCode} placeholder="IF" />
					</div>
					<div class="field">
						<label for="prodi-jenjang">Jenjang</label>
						<select id="prodi-jenjang" bind:value={formJenjang}>
							<option value="D3">D3</option>
							<option value="D4">D4</option>
							<option value="S1">S1</option>
							<option value="S2">S2</option>
							<option value="S3">S3</option>
							<option value="Profesi">Profesi</option>
							<option value="Spesialis">Spesialis</option>
						</select>
					</div>
				</div>
				<div class="field">
					<label for="prodi-fakultas">Fakultas</label>
					<select id="prodi-fakultas" bind:value={formFakultasId}>
						<option value="">— Pilih Fakultas —</option>
						{#each fakultasList as f}
							<option value={f.id}>{f.name}</option>
						{/each}
					</select>
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

{#if showEdit}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Edit Prodi</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
					<label for="prodi-edit-name">Nama Program Studi</label>
					<input id="prodi-edit-name" type="text" bind:value={formName} />
				</div>
				<div class="field-row">
					<div class="field">
						<label for="prodi-edit-code">Kode</label>
						<input id="prodi-edit-code" type="text" bind:value={formCode} />
					</div>
					<div class="field">
						<label for="prodi-edit-jenjang">Jenjang</label>
						<select id="prodi-edit-jenjang" bind:value={formJenjang}>
							<option value="D3">D3</option>
							<option value="D4">D4</option>
							<option value="S1">S1</option>
							<option value="S2">S2</option>
							<option value="S3">S3</option>
							<option value="Profesi">Profesi</option>
							<option value="Spesialis">Spesialis</option>
						</select>
					</div>
				</div>
				<div class="field">
					<label for="prodi-edit-fakultas">Fakultas</label>
					<select id="prodi-edit-fakultas" bind:value={formFakultasId}>
						<option value="">— Pilih Fakultas —</option>
						{#each fakultasList as f}
							<option value={f.id}>{f.name}</option>
						{/each}
					</select>
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
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	.cell-actions { white-space: nowrap; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.jenjang-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }

	.field-row { display: flex; gap: 12px; }
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

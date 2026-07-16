<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let tingkatList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let showForm = $state(false);
	let formName = $state('');
	let formSlug = $state('');
	let formEducationLevel = $state('menengah');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch('/api/admin/classes-structure/grade-levels');
			const json = await res.json();
			if (json.success) tingkatList = json.data;
			else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function openForm() {
		formName = ''; formSlug = ''; formEducationLevel = 'menengah';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama tingkat wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/classes-structure/grade-levels', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: formName.trim(), slug: formSlug.trim(), education_level: formEducationLevel }),
			});
			const json = await res.json();
			if (json.success) {
				tingkatList = [...tingkatList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	function generateSlug() {
		formSlug = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}
</script>

<svelte:head>
	<title>Tingkat — Struktur Kurikulum — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🏫 Tingkat</h1>
			<p class="subtitle">Jenjang & tingkat kelas (X, XI, XII, dsb.)</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openForm}>+ Tingkat Baru</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if tingkatList.length === 0}
		<div class="empty-state">
			<p>Belum ada tingkat</p>
			<button class="btn-primary" onclick={openForm}>Buat Tingkat Pertama</button>
		</div>
	{:else}
		<div class="card">
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Nama</th>
							<th>Slug</th>
							<th>Jenjang</th>
							<th>Sequence</th>
							<th>Semester</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each tingkatList as t}
							<tr>
								<td class="cell-name">{t.name}</td>
								<td><code>{t.slug}</code></td>
								<td><span class="badge">{t.education_level || t.educationLevel || 'menengah'}</span></td>
								<td>{t.sequence ?? '—'}</td>
								<td>{t.semester_count ?? 2}</td>
								<td>
									<a href="/admin/classes-structure/kelas?tingkat={t.id}" class="btn-small">Lihat Kelas</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- Modal Form -->
{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Tingkat Baru</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field">
					<label for="tingkat-name">Nama Tingkat</label>
					<input id="tingkat-name" type="text" bind:value={formName} oninput={generateSlug} placeholder="Cth: Kelas X" />
				</div>
				<div class="field">
					<label for="tingkat-slug">Slug</label>
					<input id="tingkat-slug" type="text" bind:value={formSlug} placeholder="kelas-x" />
				</div>
				<div class="field">
					<label for="tingkat-edu">Jenjang Pendidikan</label>
					<select id="tingkat-edu" bind:value={formEducationLevel}>
						<option value="sd">SD / MI</option>
						<option value="smp">SMP / MTs</option>
						<option value="menengah">SMA / SMK / MA</option>
						<option value="tinggi">Perguruan Tinggi</option>
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
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; }
	td { padding: 12px 14px; font-size: 14px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	.cell-name { font-weight: 500; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--bg-secondary); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; }

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

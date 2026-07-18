<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let kelasList: any[] = $state([]);
	let matkulList: any[] = $state([]);
	let prodiList: any[] = $state([]);
	let semesterList: any[] = $state([]);
	let dosenList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterSemester = $state('');
	let filterProdi = $state('');

	let showForm = $state(false);
	let formMatkulId = $state('');
	let formProdiId = $state('');
	let formSemesterId = $state('');
	let formDosenId = $state('');
	let formKode = $state('');
	let formNama = $state('');
	let formKapasitas = $state(40);
	let formHari = $state('');
	let formJamMulai = $state('');
	let formJamSelesai = $state('');
	let formRuangan = $state('');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [kelasRes, matkulRes, prodiRes, semRes, dosenRes] = await Promise.all([
				fetch('/api/admin/class-sessions'),
				fetch('/api/admin/course-catalog'),
				fetch('/api/admin/study-programs'),
				fetch('/api/admin/academic-semesters'),
				fetch('/api/admin/dosen'),
			]);
			const kjson = await kelasRes.json();
			const mjson = await matkulRes.json();
			const pjson = await prodiRes.json();
			const sjson = await semRes.json();
			const djson = await dosenRes.json();
			if (kjson.success) kelasList = kjson.data;
			if (mjson.success) matkulList = mjson.data;
			if (pjson.success) prodiList = pjson.data;
			if (sjson.success) semesterList = sjson.data;
			if (djson.success) dosenList = djson.data;
			if (!kjson.success) error = kjson.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		kelasList.filter(k => {
			if (filterSemester && (k.semester_id || k.semesterId) !== filterSemester) return false;
			if (filterProdi && (k.prodi_id || k.major_id) !== filterProdi) return false;
			return true;
		})
	);

	function getMatkulName(id: string) {
		return matkulList.find(m => m.id === id)?.name || '—';
	}
	function getProdiName(id: string) {
		return prodiList.find(p => p.id === id)?.name || '—';
	}
	function getSemesterName(id: string) {
		return semesterList.find(s => s.id === id)?.name || '—';
	}
	function getDosenName(id: string) {
		return dosenList.find(d => d.id === id)?.name || '—';
	}

	function openCreate() {
		formMatkulId = ''; formProdiId = ''; formSemesterId = ''; formDosenId = '';
		formKode = ''; formNama = ''; formKapasitas = 40;
		formHari = ''; formJamMulai = ''; formJamSelesai = ''; formRuangan = '';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formMatkulId) { saveError = 'Pilih mata kuliah'; return; }
		if (!formProdiId) { saveError = 'Pilih program studi'; return; }
		if (!formSemesterId) { saveError = 'Pilih semester'; return; }
		if (!formDosenId) { saveError = 'Pilih dosen pengampu'; return; }
		saving = true; saveError = '';
		try {
			const res = await fetch('/api/admin/class-sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					matkul_id: formMatkulId,
					prodi_id: formProdiId,
					semester_id: formSemesterId,
					dosen_id: formDosenId,
					kode: formKode.trim(),
					nama: formNama.trim(),
					kapasitas: formKapasitas,
					hari: formHari,
					jam_mulai: formJamMulai,
					jam_selesai: formJamSelesai,
					ruangan: formRuangan.trim(),
				}),
			});
			const json = await res.json();
			if (json.success) {
				kelasList = [...kelasList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}
  import { t } from '$lib/stores/i18n.svelte';
</script>

<svelte:head>
	<title>{t('admin.title')}</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>🏫 Kelas Kuliah</h1>
			<p class="subtitle">Jadwal kelas perkuliahan</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openCreate}>+ Kelas Baru</button>
		</div>
	</div>

	<div class="filter-bar">
		<select bind:value={filterSemester} class="filter-select">
			<option value="">Semua Semester</option>
			{#each semesterList as s}
				<option value={s.id}>{s.name}</option>
			{/each}
		</select>
		<select bind:value={filterProdi} class="filter-select">
			<option value="">Semua Prodi</option>
			{#each prodiList as p}
				<option value={p.id}>{p.name}</option>
			{/each}
		</select>
		<span class="filter-count">{filtered.length} kelas</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>{t('common.retry')}</button>
		</div>
	{:else if kelasList.length === 0}
		<div class="empty-state">
			<p>Belum ada kelas kuliah</p>
			<button class="btn-primary" onclick={openCreate}>Buat Kelas Pertama</button>
		</div>
	{:else}
		<div class="class-grid">
			{#each filtered as k}
				<div class="class-card">
					<div class="card-top">
						<span class="card-kode"><code>{k.kode || k.code || '—'}</code></span>
						<span class="card-kapasitas">{k.terisi ?? k.enrolled ?? 0}/{k.kapasitas ?? k.capacity ?? '—'}</span>
					</div>
					<div class="card-name">{k.nama || k.name || getMatkulName(k.matkul_id || k.subject_id)}</div>
					<div class="card-meta">
						<span class="meta-prodi">{getProdiName(k.prodi_id || k.major_id)}</span>
						<span class="meta-dosen">{getDosenName(k.dosen_id || k.lecturer_id)}</span>
					</div>
					<div class="card-semester">{getSemesterName(k.semester_id || k.semesterId)}</div>
					{#if k.hari || k.jam_mulai}
						<div class="card-schedule">
							{k.hari || '—'}, {k.jam_mulai || '—'} – {k.jam_selesai || '—'}
							{#if k.ruangan}
								<span class="card-ruangan">• {k.ruangan}</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Kelas Kuliah Baru</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field-row">
					<div class="field">
						<label for="kk-matkul">{t('admin.mata_kuliah')}</label>
						<select id="kk-matkul" bind:value={formMatkulId}>
							<option value="">— Pilih Matkul —</option>
							{#each matkulList as m}
								<option value={m.id}>{m.kode || m.code} — {m.name}</option>
							{/each}
						</select>
					</div>
					<div class="field">
						<label for="kk-prodi">{t('admin.program_studi')}</label>
						<select id="kk-prodi" bind:value={formProdiId}>
							<option value="">— Pilih Prodi —</option>
							{#each prodiList as p}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="kk-semester">{t('admin.semester')}</label>
						<select id="kk-semester" bind:value={formSemesterId}>
							<option value="">— Pilih Semester —</option>
							{#each semesterList as s}
								<option value={s.id}>{s.name}</option>
							{/each}
						</select>
					</div>
					<div class="field">
						<label for="kk-dosen">Dosen Pengampu</label>
						<select id="kk-dosen" bind:value={formDosenId}>
							<option value="">— Pilih Dosen —</option>
							{#each dosenList as d}
								<option value={d.id}>{d.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="kk-kode">Kode Kelas</label>
						<input id="kk-kode" type="text" bind:value={formKode} placeholder="IF-101-A" />
					</div>
					<div class="field">
						<label for="kk-nama">Nama Kelas (opsional)</label>
						<input id="kk-nama" type="text" bind:value={formNama} placeholder="Cth: Kelas A" />
					</div>
					<div class="field">
						<label for="kk-kapasitas">{t('admin.kapasitas')}</label>
						<input id="kk-kapasitas" type="number" bind:value={formKapasitas} min="1" max="200" />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="kk-hari">Hari</label>
						<select id="kk-hari" bind:value={formHari}>
							<option value="">— Pilih Hari —</option>
							<option value="Senin">{t('admin.senin')}</option>
							<option value="Selasa">{t('admin.selasa')}</option>
							<option value="Rabu">{t('admin.rabu')}</option>
							<option value="Kamis">{t('admin.kamis')}</option>
							<option value="Jumat">{t('admin.jumat')}</option>
							<option value="Sabtu">Sabtu</option>
						</select>
					</div>
					<div class="field">
						<label for="kk-jam-mulai">Jam Mulai</label>
						<input id="kk-jam-mulai" type="time" bind:value={formJamMulai} />
					</div>
					<div class="field">
						<label for="kk-jam-selesai">Jam Selesai</label>
						<input id="kk-jam-selesai" type="time" bind:value={formJamSelesai} />
					</div>
					<div class="field">
						<label for="kk-ruangan">{t('admin.ruangan')}</label>
						<input id="kk-ruangan" type="text" bind:value={formRuangan} placeholder="Cth: Lab Komputer A" />
					</div>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn-cancel" onclick={closeForm}>{t('common.cancel')}</button>
				<button class="btn-primary" onclick={submitForm} disabled={saving}>
					{saving ? 'Menyimpan...' : 'Simpan'}
				</button>
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

	.class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
	.class-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
	.class-card:hover { border-color: rgba(255,255,255,0.12); }
	.card-top { display: flex; justify-content: space-between; align-items: center; }
	.card-kode code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 11px; }
	.card-kapasitas { font-size: 12px; color: var(--text-secondary); }
	.card-name { font-size: 15px; font-weight: 600; color: var(--text); }
	.card-meta { display: flex; gap: 8px; flex-wrap: wrap; font-size: 12px; color: var(--text-secondary); }
	.card-semester { font-size: 12px; color: var(--text-tertiary); }
	.card-schedule { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
	.card-ruangan { color: var(--text-tertiary); }

	.field-row { display: flex; gap: 12px; }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 640px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; max-height: 70vh; overflow-y: auto; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

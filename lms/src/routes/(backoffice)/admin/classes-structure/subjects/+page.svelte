<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let mapelList: any[] = $state([]);
	let tingkatList: any[] = $state([]);
	let jurusanList: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');

	let filterJenis = $state('');
	let filterTingkat = $state('');

	let showForm = $state(false);
	let formName = $state('');
	let formCode = $state('');
	let formType = $state('wajib');
	let formGroupName = $state('');
	let formGradeLevelId = $state('');
	let formMajorId = $state('');
	let formMinHours = $state(2);
	let formDescription = $state('');
	let saving = $state(false);
	let saveError = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [mapelRes, tingkatRes, jurusanRes] = await Promise.all([
				fetch('/api/admin/classes-structure/subjects'),
				fetch('/api/admin/classes-structure/grade-levels'),
				fetch('/api/admin/classes-structure/majors'),
			]);
			const mjson = await mapelRes.json();
			const tjson = await tingkatRes.json();
			const jjson = await jurusanRes.json();
			if (mjson.success) mapelList = mjson.data; else error = mjson.error || 'Gagal memuat mapel';
			if (tjson.success) tingkatList = tjson.data;
			if (jjson.success) jurusanList = jjson.data;
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let filtered = $derived(
		mapelList.filter(m => {
			if (filterJenis && m.type !== filterJenis) return false;
			if (filterTingkat && (m.grade_level_id || m.gradeLevelId) !== filterTingkat) return false;
			return true;
		})
	);

	function getTingkatName(id: string) {
		return tingkatList.find(t => t.id === id)?.name || '—';
	}
	function getJurusanName(id: string) {
		return jurusanList.find(j => j.id === id)?.name || '—';
	}

	function openForm() {
		formName = ''; formCode = ''; formType = 'wajib'; formGroupName = '';
		formGradeLevelId = ''; formMajorId = ''; formMinHours = 2; formDescription = '';
		saveError = ''; showForm = true;
	}
	function closeForm() { showForm = false; }

	async function submitForm() {
		if (!formName.trim()) { saveError = 'Nama mata pelajaran wajib diisi'; return; }
		saving = true; saveError = '';
		try {
			const body: Record<string, any> = { name: formName.trim(), code: formCode.trim(), type: formType };
			if (formGroupName.trim()) body.group_name = formGroupName.trim();
			if (formGradeLevelId) body.grade_level_id = formGradeLevelId;
			if (formMajorId) body.major_id = formMajorId;
			if (formMinHours) body.min_hours_per_week = formMinHours;
			if (formDescription.trim()) body.description = formDescription.trim();

			const res = await fetch('/api/admin/classes-structure/subjects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const json = await res.json();
			if (json.success) {
				mapelList = [...mapelList, json.data];
				closeForm();
			} else saveError = json.error || 'Gagal menyimpan';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	const typeLabels: Record<string, string> = {
		wajib: 'Wajib', peminatan: 'Peminatan', muatan_lokal: 'Muatan Lokal', pilihan: 'Pilihan',
	};
	const typeColors: Record<string, string> = {
		wajib: 'background: rgba(94,106,210,0.1); color: #5e6ad2',
		peminatan: 'background: rgba(16,185,129,0.1); color: #10b981',
		muatan_lokal: 'background: rgba(245,158,11,0.1); color: #f59e0b',
		pilihan: 'background: rgba(236,72,153,0.1); color: #ec4899',
	};

	const columns: ColumnDef<any, any>[] = [
		{ header: 'Nama', accessorKey: 'name', cell: ({ getValue }) => `<span style="font-weight:500">${getValue()}</span>` },
		{ header: 'Kode', accessorKey: 'code', cell: ({ getValue }) => `<code>${getValue() || '—'}</code>` },
		{
			header: 'Jenis', accessorKey: 'type',
			cell: ({ getValue }) => {
				const t = getValue() as string;
				return `<span class="type-badge" style="${typeColors[t] || typeColors['wajib']}">${typeLabels[t] || t}</span>`;
			}
		},
		{ header: 'Kelompok', accessorKey: 'group_name', cell: ({ row }) => `<span style="color:var(--text-secondary)">${row.original.group_name || row.original.groupName || '—'}</span>` },
		{ header: 'Tingkat', id: 'tingkat', cell: ({ row }) => getTingkatName(row.original.grade_level_id || row.original.gradeLevelId) },
		{ header: 'Jurusan', id: 'jurusan', cell: ({ row }) => getJurusanName(row.original.major_id || row.original.majorId) || '—' },
		{ header: 'JP/mgg', accessorKey: 'min_hours_per_week', cell: ({ row }) => `<span style="text-align:center">${row.original.min_hours_per_week ?? row.original.minHoursPerWeek ?? '—'}</span>` },
		{ header: 'KD', accessorKey: 'kd_count', cell: ({ row }) => `<span style="text-align:center">${row.original.kd_count ?? row.original.kompetensi_dasar_count ?? '—'}</span>` },
		{
			header: 'Aksi', id: 'aksi',
			cell: ({ row }) => `<a href="/admin/classes-structure/mapel/${row.original.id}" style="color:var(--accent);text-decoration:none;font-size:13px;font-weight:500">KD</a>`
		},
	];
</script>

<svelte:head>
	<title>Mata Pelajaran — Struktur Kurikulum — Admin</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📖 Mata Pelajaran</h1>
			<p class="subtitle">Kelola data mata pelajaran & kompetensi dasar</p>
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
			<button class="btn-primary" onclick={openForm}>+ Mapel Baru</button>
		</div>
	</div>

	<div class="filter-bar">
		<select bind:value={filterJenis} class="filter-select">
			<option value="">Semua Jenis</option>
			<option value="wajib">Wajib</option>
			<option value="peminatan">Peminatan</option>
			<option value="muatan_lokal">Muatan Lokal</option>
			<option value="pilihan">Pilihan</option>
		</select>
		<select bind:value={filterTingkat} class="filter-select">
			<option value="">Semua Tingkat</option>
			{#each tingkatList as t}
				<option value={t.id}>{t.name}</option>
			{/each}
		</select>
		<span class="filter-count">{filtered.length} mapel</span>
	</div>

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>Coba Lagi</button>
		</div>
	{:else if mapelList.length === 0}
		<div class="empty-state">
			<p>Belum ada mata pelajaran</p>
			<button class="btn-primary" onclick={openForm}>Buat Mapel Pertama</button>
		</div>
	{:else}
		<DataTable {columns} data={filtered} pageSize={20} showSearch={true} searchPlaceholder="Cari mata pelajaran..." />
	{/if}
</div>

{#if showForm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeForm} role="button" tabindex="-1">
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<h2>Mata Pelajaran Baru</h2>
				<button class="modal-close" onclick={closeForm}>✕</button>
			</div>
			<div class="modal-body">
				{#if saveError}<div class="form-error">{saveError}</div>{/if}
				<div class="field-row">
					<div class="field">
						<label for="mapel-name">Nama Mapel</label>
						<input id="mapel-name" type="text" bind:value={formName} placeholder="Cth: Matematika" />
					</div>
					<div class="field">
						<label for="mapel-code">Kode</label>
						<input id="mapel-code" type="text" bind:value={formCode} placeholder="MTK" />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="mapel-type">Jenis</label>
						<select id="mapel-type" bind:value={formType}>
							<option value="wajib">Wajib</option>
							<option value="peminatan">Peminatan</option>
							<option value="muatan_lokal">Muatan Lokal</option>
							<option value="pilihan">Pilihan</option>
						</select>
					</div>
					<div class="field">
						<label for="mapel-group">Kelompok</label>
						<input id="mapel-group" type="text" bind:value={formGroupName} placeholder="A, B, C" />
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="mapel-tingkat">Tingkat (opsional)</label>
						<select id="mapel-tingkat" bind:value={formGradeLevelId}>
							<option value="">— Semua Tingkat —</option>
							{#each tingkatList as t}
								<option value={t.id}>{t.name}</option>
							{/each}
						</select>
					</div>
					<div class="field">
						<label for="mapel-jurusan">Jurusan (opsional)</label>
						<select id="mapel-jurusan" bind:value={formMajorId}>
							<option value="">— Semua Jurusan —</option>
							{#each jurusanList as j}
								<option value={j.id}>{j.name}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="field-row">
					<div class="field">
						<label for="mapel-hours">JP per Minggu</label>
						<input id="mapel-hours" type="number" bind:value={formMinHours} min="1" max="40" />
					</div>
				</div>
				<div class="field">
					<label for="mapel-desc">Deskripsi (opsional)</label>
					<textarea id="mapel-desc" bind:value={formDescription} rows="3" placeholder="Deskripsi mata pelajaran..."></textarea>
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
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--hover); }
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
	.modal { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 0; }
	.modal-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
	.modal-close { background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 4px; }
	.modal-body { padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
	.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 0 20px 18px; }
	.field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
	.field label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
	.field input, .field select { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; }
	.field input:focus, .field select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field textarea { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 14px; resize: vertical; font-family: inherit; }
	.field textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-dim); }
	.field-row { display: flex; gap: 12px; }
	.form-error { padding: 10px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
</style>

<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Button } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	let kelasList: any[] = $state([]);
	let selectedKelas: any[] = $state([]);
	let semesterAktif: any = $state(null);
	let mahasiswaId = $state('');
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	let submitError = $state('');
	let submitSuccess = $state('');
	let krsStatus = $state('');
	let krsId = $state('');

	onMount(() => { if (browser) loadData(); });

	async function loadData() {
		loading = true; error = '';
		try {
			const [kelasRes, semRes, krsRes] = await Promise.all([
				fetch('/api/mahasiswa/kelas-tersedia'),
				fetch('/api/mahasiswa/semester-aktif'),
				fetch('/api/mahasiswa/krs-saya'),
			]);
			const kjson = await kelasRes.json();
			const sjson = await semRes.json();
			const krsjson = await krsRes.json();

			if (kjson.success) kelasList = kjson.data || [];
			if (sjson.success) semesterAktif = sjson.data;
			if (krsjson.success && krsjson.data) {
				selectedKelas = krsjson.data.kelas_ids || krsjson.data.kelas_kuliah_ids || [];
				krsStatus = krsjson.data.status || 'draft';
				krsId = krsjson.data.id || '';
			}
			if (!kjson.success) error = kjson.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	let totalSks = $derived(
		kelasList
			.filter(k => selectedKelas.includes(k.id))
			.reduce((sum, k) => sum + (k.sks ?? k.credits ?? 0), 0)
	);

	function toggleKelas(id: string) {
		if (krsStatus === 'disetujui' || krsStatus === 'approved') return;
		if (selectedKelas.includes(id)) {
			selectedKelas = selectedKelas.filter(k => k !== id);
		} else {
			selectedKelas = [...selectedKelas, id];
		}
	}

	const isApproved = $derived(krsStatus === 'disetujui' || krsStatus === 'approved');

	const kelasTableData = $derived(
		kelasList.map(k => ({
			...k,
			_selected: selectedKelas.includes(k.id),
			_skss: k.sks ?? k.credits ?? 0,
			_schedule: `${k.hari || '—'}${k.jam_mulai ? ` ${k.jam_mulai}–${k.jam_selesai || ''}` : ''}`,
		}))
	);

	const columns: ColumnDef<any, any>[] = [
		{
			header: t('mahasiswa.col_select'),
			accessorKey: '_selected',
			cell: ({ row }) => {
				const k = row.original;
				return `<input type="checkbox" ${k._selected ? 'checked' : ''} ${isApproved ? 'disabled' : ''} data-id="${k.id}" class="krs-checkbox" />`;
			}
		},
		{
			header: t('mahasiswa.col_code'),
			accessorKey: 'kode',
			cell: ({ getValue }) => {
				const v = getValue();
				return `<code>${v || '—'}</code>`;
			}
		},
		{
			header: t('mahasiswa.col_course'),
			accessorKey: 'nama',
			cell: ({ row }) => {
				const k = row.original;
				return `<span style="font-weight:500">${k.nama || k.name || k.matkul_name || '—'}</span>`;
			}
		},
		{
			header: t('mahasiswa.col_sks'),
			accessorKey: '_skss',
			cell: ({ getValue }) => `<span style="text-align:center;font-weight:600">${getValue()}</span>`
		},
		{ header: t('mahasiswa.col_lecturer'), accessorKey: 'dosen_name' },
		{
			header: t('mahasiswa.col_schedule'),
			accessorKey: '_schedule',
		},
		{ header: t('mahasiswa.col_room'), accessorKey: 'ruangan' },
	];

	function handleTableChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.classList.contains('krs-checkbox')) {
			const id = target.getAttribute('data-id');
			if (id) toggleKelas(id);
		}
	}

	async function simpanKrs() {
		submitting = true; submitError = ''; submitSuccess = '';
		try {
			const res = await fetch('/api/mahasiswa/krs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					kelas_kuliah_ids: selectedKelas,
					semester_id: semesterAktif?.id,
				}),
			});
			const json = await res.json();
			if (json.success) {
				krsId = json.data.id || krsId;
				krsStatus = json.data.status || 'draft';
				submitSuccess = 'KRS berhasil disimpan';
			} else submitError = json.error || 'Gagal menyimpan KRS';
		} catch { submitError = 'Terjadi kesalahan'; }
		finally { submitting = false; }
	}

	async function submitKrs() {
		if (selectedKelas.length === 0) { submitError = 'Pilih minimal 1 mata kuliah'; return; }
		submitting = true; submitError = ''; submitSuccess = '';
		try {
			const res = await fetch('/api/mahasiswa/krs/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ krs_id: krsId }),
			});
			const json = await res.json();
			if (json.success) {
				krsStatus = 'pending';
				submitSuccess = 'KRS berhasil diajukan ke Kaprodi';
			} else submitError = json.error || 'Gagal mengajukan KRS';
		} catch { submitError = 'Terjadi kesalahan'; }
		finally { submitting = false; }
	}

	const statusLabels: Record<string, string> = {
		draft: 'Draft',
		pending: 'Menunggu Persetujuan',
		disetujui: 'Disetujui',
		approved: 'Disetujui',
		ditolak: 'Ditolak',
		rejected: 'Ditolak',
	};
	const statusColors: Record<string, string> = {
		draft: 'var(--text-quaternary)',
		pending: '#f59e0b',
		disetujui: '#10b981',
		approved: '#10b981',
		ditolak: '#ef4444',
		rejected: '#ef4444',
	};
</script>

<svelte:head>
	<title>KRS — Mahasiswa</title>
</svelte:head>

<div class="page">
	<div class="header">
		<div>
			<h1>📋 Kartu Rencana Studi</h1>
			<p class="subtitle">
				{semesterAktif ? `Semester Aktif: ${semesterAktif.name}` : 'Tidak ada semester aktif'}
			</p>
		</div>
		<div class="header-actions">
			<Button variant="ghost" size="sm" onclick={loadData}>🔄</Button>
		</div>
	</div>

	{#if krsStatus}
		<div class="status-bar" style="--badge-color: {statusColors[krsStatus] || 'var(--text-quaternary)'}">
			<span class="status-dot"></span>
			<span>Status KRS: <strong>{statusLabels[krsStatus] || krsStatus}</strong></span>
		</div>
	{/if}

	<div class="summary-card">
		<div class="summary-item">
			<span class="summary-label">Total SKS</span>
			<span class="summary-value">{totalSks}</span>
		</div>
		<div class="summary-item">
			<span class="summary-label">Mata Kuliah</span>
			<span class="summary-value">{selectedKelas.length}</span>
		</div>
	</div>

	{#if submitSuccess}
		<div class="success-msg">{submitSuccess}</div>
	{/if}
	{#if submitError}
		<div class="error-msg">{submitError}</div>
	{/if}

	{#if loading}
		<div class="loading">Memuat data...</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<Button variant="primary" onclick={loadData}>Coba Lagi</Button>
		</div>
	{:else if kelasList.length === 0}
		<div class="empty-state">
			<p>Tidak ada kelas kuliah tersedia untuk semester ini</p>
		</div>
	{:else}
		<div class="card" onchange={handleTableChange}>
			<div class="table-container">
				<DataTable {columns} data={kelasTableData} pageSize={20} showSearch={true} searchPlaceholder="Cari mata kuliah..." />
			</div>
		</div>
	{/if}

	<div class="actions">
		<Button variant="secondary" onclick={simpanKrs} disabled={submitting || loading}>
			{submitting ? 'Menyimpan...' : 'Simpan Draft'}
		</Button>
		<Button
			variant="primary"
			onclick={submitKrs}
			disabled={submitting || loading || (krsStatus === 'disetujui' || krsStatus === 'approved' || krsStatus === 'pending')}
		>
			{submitting ? 'Mengirim...' : 'Ajukan ke Kaprodi'}
		</Button>
	</div>
</div>

<style>
	.page { max-width: 1100px; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
	.header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 8px 16px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-secondary { padding: 8px 16px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-secondary:hover { background: var(--surface-hover); }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.status-bar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
	.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--badge-color, var(--text-quaternary)); flex-shrink: 0; }

	.summary-card { display: flex; gap: 20px; margin-bottom: 16px; }
	.summary-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 20px; flex: 1; }
	.summary-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 4px; }
	.summary-value { font-size: 28px; font-weight: 700; color: var(--accent); }

	.success-msg { padding: 10px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
	.error-msg { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }
	.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
	.table-container { overflow-x: auto; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 12px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); border-bottom: 1px solid var(--border); font-weight: 600; white-space: nowrap; }
	td { padding: 12px 14px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
	tr:last-child td { border-bottom: none; }
	tr.row-selected { background: rgba(94,106,210,0.04); }
	tr.row-disabled { opacity: 0.6; }
	.cell-name { font-weight: 500; }
	.cell-num { text-align: center; font-weight: 600; }
	.cell-schedule { font-size: 12px; }
	.time { color: var(--text-tertiary); font-size: 11px; }
	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; cursor: pointer; }
	input[type="checkbox"]:disabled { opacity: 0.4; cursor: not-allowed; }

	.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
</style>

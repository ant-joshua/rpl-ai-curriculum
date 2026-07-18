<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
	import { t } from '$lib/stores/i18n.svelte';

	let { data } = $props();

	let kelasKuliahId = $derived($page.params.kelasKuliahId);

	let mahasiswaList: any[] = $state([]);
	let kelasInfo: any = $state(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saveError = $state('');
	let saveSuccess = $state('');

	onMount(() => {
		if (!browser) return;
		loadData();
	});

	if (browser) {
		(window as any).__updNilai = (id: string, val: string) => {
			const m = mahasiswaList.find((x: any) => (x.id || x.mahasiswa_id || x.student_id) === id);
			if (m) updateNilai(m, val === '' ? null : Math.min(100, Math.max(0, Number(val))));
		};
	}

	async function loadData() {
		loading = true; error = '';
		try {
			const res = await fetch(`/api/dosen/kelas/${kelasKuliahId}/nilai`);
			const json = await res.json();
			if (json.success) {
				kelasInfo = json.data.kelas || json.data.class_info || null;
				mahasiswaList = json.data.mahasiswa || json.data.students || [];
			} else error = json.error || 'Gagal memuat data';
		} catch { error = 'Gagal terhubung ke server'; }
		finally { loading = false; }
	}

	function nilaiHuruf(nilai: number | null | undefined): string {
		if (nilai === null || nilai === undefined || nilai < 0) return '—';
		if (nilai >= 85) return 'A';
		if (nilai >= 80) return 'A-';
		if (nilai >= 75) return 'B+';
		if (nilai >= 70) return 'B';
		if (nilai >= 65) return 'B-';
		if (nilai >= 60) return 'C+';
		if (nilai >= 55) return 'C';
		if (nilai >= 45) return 'D';
		return 'E';
	}

	function nilaiWarna(huruf: string): string {
		switch (huruf) {
			case 'A': case 'A-': return 'background:rgba(16,185,129,0.1);color:#10b981';
			case 'B+': case 'B': case 'B-': return 'background:rgba(94,106,210,0.1);color:#5e6ad2';
			case 'C+': case 'C': return 'background:rgba(245,158,11,0.1);color:#f59e0b';
			case 'D': return 'background:rgba(239,68,68,0.1);color:#ef4444';
			case 'E': return 'background:rgba(239,68,68,0.2);color:#dc2626';
			default: return 'background:transparent;color:var(--text-quaternary)';
		}
	}

	function updateNilai(m: any, nilai: number | null) {
		m.nilai_angka = nilai;
	}

	let allFilled = $derived(
		mahasiswaList.length > 0 && mahasiswaList.every(m => m.nilai_angka !== null && m.nilai_angka >= 0)
	);

	let rataRata = $derived.by(() => {
		const valid = mahasiswaList.filter(m => m.nilai_angka !== null && m.nilai_angka >= 0);
		if (valid.length === 0) return null;
		return valid.reduce((sum, m) => sum + (m.nilai_angka ?? 0), 0) / valid.length;
	});

	async function simpanNilai() {
		const entries = mahasiswaList.map(m => ({
			mahasiswa_id: m.id || m.mahasiswa_id || m.student_id,
			nilai_angka: m.nilai_angka,
		}));

		saving = true; saveError = ''; saveSuccess = '';
		try {
			const res = await fetch(`/api/dosen/kelas/${kelasKuliahId}/nilai`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ nilai: entries }),
			});
			const json = await res.json();
			if (json.success) {
				saveSuccess = 'Nilai berhasil disimpan';
				setTimeout(() => { saveSuccess = ''; }, 3000);
			} else saveError = json.error || 'Gagal menyimpan nilai';
		} catch { saveError = 'Terjadi kesalahan'; }
		finally { saving = false; }
	}

	function esc(s: string): string {
		return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: t('dosen.col_no'),
			accessorKey: '__no',
			cell: ({ row }) => `<span style="text-align:center;display:block;color:var(--text-tertiary)">${row.index + 1}</span>`
		},
		{
			header: t('dosen.col_nim'),
			accessorKey: 'nim',
			cell: ({ getValue, row }) => {
				const nim = getValue() || row.original.student_nim || '—';
				return `<code style="background:var(--bg-secondary);padding:2px 6px;border-radius:4px;font-size:12px">${esc(nim)}</code>`;
			}
		},
		{
			header: t('dosen.col_name'),
			accessorKey: 'name',
			cell: ({ getValue, row }) => {
				const name = getValue() || row.original.nama || row.original.mahasiswa_name || '—';
				return `<span style="font-weight:500">${esc(name)}</span>`;
			}
		},
		{
			header: t('dosen.col_score'),
			accessorKey: 'nilai_angka',
			cell: ({ getValue, row }) => {
				const m = row.original;
				const val = getValue() as number | null | undefined;
				const filled = val !== null && val !== undefined && val >= 0 ? 'border-color:var(--accent)' : '';
				return `<input type="number" min="0" max="100" placeholder="0-100"
					style="width:80px;padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-secondary);color:var(--text);font-size:14px;font-weight:600;text-align:center;font-family:inherit;outline:none;${filled}"
					value="${val ?? ''}"
					oninput="window.__updNilai('${esc(m.id || m.mahasiswa_id || m.student_id)}', this.value)"
					onfocus="this.dataset.idx='${row.index}'" />`;
			}
		},
		{
			header: t('dosen.col_grade'),
			accessorKey: '__huruf',
			cell: ({ row }) => {
				const huruf = nilaiHuruf(row.original.nilai_angka);
				const style = nilaiWarna(huruf);
				return `<span style="display:inline-block;padding:3px 12px;border-radius:6px;font-size:13px;font-weight:700;min-width:36px;text-align:center;${style}">${huruf}</span>`;
			}
		}
	];
</script>

<svelte:head>
	<title>Input Nilai — {kelasInfo?.nama || kelasInfo?.name || 'Kelas'} — Dosen</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<div class="breadcrumb"><a href="/dosen/kelas">← {t('dosen.breadcrumb')}</a></div>
			<h1>{t('dosen.heading')}</h1>
			{#if kelasInfo}
				<p class="subtitle">
					{kelasInfo.nama || kelasInfo.name || kelasInfo.matkul_name || '—'}
					{#if kelasInfo.kode || kelasInfo.code} <code>{kelasInfo.kode || kelasInfo.code}</code>{/if}
					— <span class="meta-semester">{kelasInfo.semester_name || kelasInfo.semester || '—'}</span>
				</p>
			{/if}
		</div>
		<div class="header-actions">
			<button class="btn-refresh" onclick={loadData}>🔄</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">{t('dosen.loading_students')}</div>
	{:else if error}
		<div class="error-state">
			<p class="error-msg">{error}</p>
			<button class="btn-primary" onclick={loadData}>{t('common.retry')}</button>
		</div>
	{:else if mahasiswaList.length === 0}
		<div class="empty-state">
			<p>{t('dosen.no_students')}</p>
		</div>
	{:else}
		<div class="info-bar">
			<div class="info-item">
				<span class="info-label">{t('dosen.students_label')}</span>
				<span class="info-value">{mahasiswaList.length}</span>
			</div>
			<div class="info-item">
				<span class="info-label">{t('dosen.graded_label')}</span>
				<span class="info-value">{mahasiswaList.filter(m => m.nilai_angka !== null && m.nilai_angka >= 0).length}/{mahasiswaList.length}</span>
			</div>
			{#if rataRata !== null}
				<div class="info-item">
					<span class="info-label">{t('dosen.average_label')}</span>
					<span class="info-value">{rataRata.toFixed(1)}</span>
				</div>
			{/if}
		</div>

		{#if saveSuccess}
			<div class="success-msg">{saveSuccess}</div>
		{/if}
		{#if saveError}
			<div class="error-msg">{saveError}</div>
		{/if}

		<DataTable
			{columns}
			data={mahasiswaList}
			pageSize={200}
			showSearch={false}
			showPagination={false}
			emptyMessage={t('dosen.empty_table')}
		/>

		<div class="actions">
			<button class="btn-primary" onclick={simpanNilai} disabled={saving}>
				{saving ? t('dosen.saving') : t('dosen.save_grades')}
			</button>
		</div>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 24px; font-weight: 700; margin: 0; }
	.subtitle { color: var(--text-secondary); font-size: 14px; margin: 4px 0 0; }
	.subtitle code { background: var(--bg-secondary); padding: 1px 6px; border-radius: 4px; font-size: 12px; }
	.meta-semester { color: var(--text-tertiary); }
	.header-actions { display: flex; gap: 8px; }
	.btn-primary { padding: 10px 24px; background: var(--accent); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; font-family: inherit; }
	.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
	.btn-refresh { padding: 8px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-secondary); color: var(--text); font-size: 13px; cursor: pointer; }
	.btn-refresh:hover { background: var(--surface-hover); }

	.info-bar { display: flex; gap: 20px; margin-bottom: 16px; }
	.info-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 18px; flex: 1; }
	.info-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 4px; }
	.info-value { font-size: 22px; font-weight: 700; color: var(--accent); }

	.success-msg { padding: 10px 14px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #10b981; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }
	.error-msg { padding: 10px 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #ef4444; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }

	.loading { text-align: center; padding: 40px; color: var(--text-secondary); }
	.error-state { text-align: center; padding: 40px; }
	.error-msg { color: #ef4444; margin-bottom: 12px; }
	.empty-state { text-align: center; padding: 60px 20px; color: var(--text-secondary); }

	code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
	.actions { display: flex; justify-content: flex-end; margin-top: 20px; }
</style>

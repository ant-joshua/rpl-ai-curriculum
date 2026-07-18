<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { DataTable, Loading, EmptyState } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';
import { t } from '$lib/stores/i18n.svelte';

	let grades: any[] = $state([]);
	let studentInfo: any = $state(null);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	onMount(() => {
		if (!browser) return;
		loadGrades();
	});

	async function loadGrades() {
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/guru/nilai/rekap-siswa?semester=${selectedSemester}`);
			const json = await res.json();
			if (json.success) {
				grades = json.data?.grades || [];
				studentInfo = json.data?.student || null;
			} else error = json.error || 'Gagal memuat nilai';
		} catch { error = 'Gagal memuat data nilai'; }
		finally { loading = false; }
	}

	function gradeColor(pct: number | null): string {
		if (pct === null) return 'var(--text-secondary)';
		if (pct >= 85) return '#22c55e';
		if (pct >= 70) return '#27ae60';
		if (pct >= 55) return '#f1c40f';
		if (pct >= 45) return '#f59e0b';
		return '#ef4444';
	}

	function formatPct(val: number | null): string {
		if (val === null || val === undefined) return '-';
		return Number(val).toFixed(1);
	}

	function fmtColored(val: number | null): string {
		return `<span style="color:${gradeColor(val)};font-weight:600;font-size:13px;text-align:center">${formatPct(val)}</span>`;
	}

	const columns: ColumnDef<any, any>[] = [
		{
			header: 'Mata Pelajaran',
			accessorKey: 'subject_name',
			cell: ({ getValue, row }) => {
				const name = getValue() as string || row.original.subject;
				return `<span style="font-weight:600;font-size:13px">${name}</span>`;
			}
		},
		{
			header: 'Kelas',
			accessorKey: 'class_name',
			cell: ({ getValue, row }) => `<span style="text-align:center;font-size:13px">${getValue() || row.original.class || '-'}</span>`
		},
		{
			header: 'Rata PH',
			accessorKey: 'rata_ph',
			cell: ({ getValue }) => fmtColored(getValue() as number | null)
		},
		{
			header: 'PTS',
			accessorKey: 'pts',
			cell: ({ getValue }) => fmtColored(getValue() as number | null)
		},
		{
			header: 'PAS',
			accessorKey: 'pas',
			cell: ({ getValue }) => fmtColored(getValue() as number | null)
		},
		{
			header: 'NA Pengetahuan',
			accessorKey: 'na_pengetahuan',
			cell: ({ getValue }) => fmtColored(getValue() as number | null)
		},
		{
			header: 'Predikat',
			accessorKey: 'predikat_pengetahuan',
			cell: ({ getValue }) => {
				const v = getValue() as string;
				return v ? `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(94,106,210,0.1);color:#5e6ad2">${v}</span>` : '<span style="color:var(--text-quaternary)">-</span>';
			}
		},
		{
			header: 'Rata Keterampilan',
			accessorKey: 'rata_keterampilan',
			cell: ({ getValue }) => fmtColored(getValue() as number | null)
		},
		{
			header: 'Predikat',
			accessorKey: 'predikat_keterampilan',
			cell: ({ getValue }) => {
				const v = getValue() as string;
				return v ? `<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600;background:rgba(94,106,210,0.1);color:#5e6ad2">${v}</span>` : '<span style="color:var(--text-quaternary)">-</span>';
			}
		},
	];
</script>

<svelte:head>
	<title>Nilai Saya — Siswa — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<div>
			<h1>{t('siswa.nilai_saya')}</h1>
			<p class="subtitle">
				{#if studentInfo}
					{studentInfo.display_name || studentInfo.name || studentInfo.username}
				{:else}
					{t('siswa.rekap_nilai')}
				{/if}
			</p>
		</div>
		<div class="header-actions">
			<select class="sem-select" bind:value={selectedSemester} onchange={() => loadGrades()}>
				<option value="1">{t('nilai.semester_ganjil')}</option>
				<option value="2">{t('nilai.semester_genap')}</option>
			</select>
		</div>
	</div>

	{#if loading}
		<Loading message={t('common.loading')} />
	{:else if error}
		<div class="error-state">{error}</div>
	{:else if grades.length === 0}
		<EmptyState icon="📊" message={t('siswa.belum_ada_nilai')} description={t('siswa.belum_ada_nilai_desc')} />
	{:else}
		<DataTable
			{columns}
			data={grades}
			showSearch={false}
			showPagination={false}
			emptyMessage={t('siswa.belum_ada_nilai_tabel')}
		/>
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
	.page-header h1 { font-size: 24px; margin: 0 0 4px; }
	.subtitle { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
</style>

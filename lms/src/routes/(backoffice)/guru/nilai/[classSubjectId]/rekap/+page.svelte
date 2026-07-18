<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DataTable, Loading, EmptyState } from '$lib/components/ui';
	import type { ColumnDef } from '@tanstack/svelte-table';

	let classSubjectId = $state('');
	let classSubject: any = $state(null);
	let rekap: any[] = $state([]);
	let loading = $state(true);
	let error = $state('');
	let selectedSemester = $state('1');

	$effect(() => {
		if (browser) {
			const p = $page.url.pathname;
			const parts = p.split('/');
			const idx = parts.indexOf('nilai');
			if (idx !== -1 && parts[idx + 1]) classSubjectId = parts[idx + 1];
			const sem = $page.url.searchParams.get('semester');
			if (sem) selectedSemester = sem;
		}
	});

	onMount(() => {
		if (!browser) return;
		loadRekap();
	});

	async function loadRekap() {
		if (!classSubjectId) { setTimeout(() => loadRekap(), 100); return; }
		loading = true;
		error = '';
		try {
			const [csRes, rkRes] = await Promise.all([
				fetch(`/api/guru/kelas/${classSubjectId}`),
				fetch(`/api/guru/nilai/rekap?class_subject_id=${classSubjectId}&semester=${selectedSemester}`),
			]);
			const cs = await csRes.json();
			if (cs.success) classSubject = cs.data;

			const rk = await rkRes.json();
			if (rk.success) rekap = rk.data || [];
			else error = rk.error || 'Gagal memuat rekap';
		} catch { error = 'Gagal memuat rekap'; }
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
			header: 'Siswa',
			accessorKey: 'name',
			cell: ({ getValue, row }) => `<span style="font-weight:600;font-size:13px">${getValue() || row.original.display_name || 'Siswa'}</span>`
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
	<title>Rekap Nilai — {classSubject?.subject_name || ''} — Guru — RPL AI Curriculum</title>
</svelte:head>

<div class="page">
	{#if loading}
		<Loading message="Memuat rekap nilai..." />
	{:else if error && !classSubject}
		<div class="error-state">{error}</div>
	{:else}
		<div class="page-header">
			<div>
				<div class="breadcrumb">
					<a href="/guru/nilai/{classSubjectId}">← {classSubject?.subject_name || 'Nilai'}</a>
				</div>
				<h1>📊 Rekap Nilai</h1>
				<p class="meta">{classSubject?.class_name} — {classSubject?.subject_name}</p>
			</div>
			<div class="header-actions">
				<select class="sem-select" bind:value={selectedSemester} onchange={() => loadRekap()}>
					<option value="1">Semester Ganjil</option>
					<option value="2">Semester Genap</option>
				</select>
			</div>
		</div>

		{#if rekap.length === 0}
			<EmptyState icon="📊" message="Belum ada data rekap. Input nilai terlebih dahulu." />
		{:else}
			<DataTable
				{columns}
				data={rekap}
				showSearch={false}
				showPagination={false}
				emptyMessage="Belum ada data rekap"
			/>
		{/if}
	{/if}
</div>

<style>
	.page { max-width: 1100px; }
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
	.breadcrumb { font-size: 13px; margin-bottom: 8px; }
	.breadcrumb a { color: var(--accent); text-decoration: none; font-weight: 500; }
	.breadcrumb a:hover { text-decoration: underline; }
	.page-header h1 { font-size: 22px; margin: 0 0 4px; }
	.meta { font-size: 14px; color: var(--text-secondary); margin: 0; }
	.header-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
	.sem-select { padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-secondary); color: var(--text); font-size: 13px; font-family: inherit; cursor: pointer; }
	.error-state { padding: 40px 20px; text-align: center; color: var(--danger); }
</style>
